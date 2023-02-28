"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExportFCT = void 0;
const eth_sig_util_1 = require("@metamask/eth-sig-util");
const utils_1 = require("batchMultiSigCall/utils");
const utils_2 = require("ethers/lib/utils");
const lodash_1 = __importDefault(require("lodash"));
const constants_1 = require("../../../constants");
const constants_2 = require("../../constants");
const helpers_1 = require("../../helpers");
const handlers_1 = require("../../helpers/handlers");
const EIP712_1 = require("../EIP712");
const EIP712StructTypes_1 = require("../EIP712StructTypes");
const Options_1 = require("../Options");
const helpers = __importStar(require("./helpers"));
class ExportFCT {
    constructor(FCT) {
        this.FCT = FCT;
        this.salt = [...Array(6)].map(() => Math.floor(Math.random() * 16).toString(16)).join("");
        this.calls = FCT.decodedCalls;
        this.version = FCT.version;
        this.typedData = this.getTypedData();
        this.sessionId = (0, helpers_1.getSessionId)(this.salt, this.version, this.FCT.options);
        this.mcall = this.getCalls();
        if (this.FCT.calls.length === 0) {
            throw new Error("FCT has no calls");
        }
        Options_1.Options.verify(this.FCT.options);
    }
    get() {
        return {
            typedData: this.typedData,
            builder: this.FCT.options.builder,
            typeHash: (0, utils_2.hexlify)(eth_sig_util_1.TypedDataUtils.hashType(this.typedData.primaryType, this.typedData.types)),
            sessionId: this.sessionId,
            nameHash: (0, utils_2.id)(this.FCT.options.name),
            mcall: this.mcall,
            variables: [],
            externalSigners: [],
            signatures: [(0, utils_1.getAuthenticatorSignature)(this.typedData)],
            computed: this.FCT.convertedComputed.map((c) => {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { index, ...rest } = c;
                return rest;
            }),
        };
    }
    getCalls() {
        const typedData = this.typedData;
        const calls = this.calls;
        return calls.map((call, index) => {
            const usedTypeStructs = (0, helpers_1.getUsedStructTypes)(typedData, `transaction${index + 1}`);
            return {
                typeHash: (0, utils_2.hexlify)(eth_sig_util_1.TypedDataUtils.hashType(`transaction${index + 1}`, typedData.types)),
                ensHash: (0, utils_2.id)(call.toENS || ""),
                functionSignature: (0, handlers_1.handleFunctionSignature)(call),
                value: this.FCT.handleVariableValue(call.to, "uint256", "0"),
                callId: (0, helpers_1.manageCallId)(calls, call, index),
                from: this.FCT.handleVariableValue(call.from, "address"),
                to: this.FCT.handleVariableValue(call.to, "address"),
                data: (0, handlers_1.handleData)(call),
                types: (0, handlers_1.handleTypes)(call),
                typedHashes: usedTypeStructs.length > 0
                    ? usedTypeStructs.map((hash) => (0, utils_2.hexlify)(eth_sig_util_1.TypedDataUtils.hashType(hash, typedData.types)))
                    : [],
            };
        });
    }
    getTypedData() {
        return {
            types: this.getTypedDataTypes(),
            primaryType: this.getPrimaryType(),
            domain: this.getTypedDataDomain(),
            message: this.getTypedDataMessage(),
        };
    }
    getTypedDataMessage() {
        const transactionTypedData = this.getTransactionTypedDataMessage();
        const FCTOptions = this.FCT.options;
        const { recurrency, multisig } = FCTOptions;
        let optionalMessage = {};
        if (Number(recurrency.maxRepeats) > 1) {
            optionalMessage = lodash_1.default.merge(optionalMessage, {
                recurrency: {
                    max_repeats: recurrency.maxRepeats,
                    chill_time: recurrency.chillTime,
                    accumetable: recurrency.accumetable,
                },
            });
        }
        if (multisig.externalSigners.length > 0) {
            optionalMessage = lodash_1.default.merge(optionalMessage, {
                multisig: {
                    external_signers: multisig.externalSigners,
                    minimum_approvals: multisig.minimumApprovals || "2",
                },
            });
        }
        return {
            meta: {
                name: FCTOptions.name || "",
                builder: FCTOptions.builder || "0x0000000000000000000000000000000000000000",
                selector: this.FCT.batchMultiSigSelector,
                version: this.version,
                random_id: `0x${this.salt}`,
                eip712: true,
                auth_enabled: FCTOptions.authEnabled,
            },
            limits: {
                valid_from: FCTOptions.validFrom,
                expires_at: FCTOptions.expiresAt,
                gas_price_limit: FCTOptions.maxGasPrice,
                purgeable: FCTOptions.purgeable,
                blockable: FCTOptions.blockable,
            },
            ...optionalMessage,
            ...(0, helpers_1.getComputedVariableMessage)(this.FCT.convertedComputed),
            ...transactionTypedData,
        };
    }
    getTypedDataTypes() {
        const { structTypes, transactionTypes } = new EIP712StructTypes_1.EIP712StructTypes(this.calls);
        const FCTOptions = this.FCT.options;
        const { recurrency, multisig } = FCTOptions;
        let optionalTypes = {};
        const additionalTypesInPrimary = [];
        if (Number(recurrency.maxRepeats) > 1) {
            optionalTypes = lodash_1.default.merge(optionalTypes, { Recurrency: EIP712_1.EIP712.types.recurrency });
            additionalTypesInPrimary.push({ name: "recurrency", type: "Recurrency" });
        }
        if (multisig.externalSigners.length > 0) {
            optionalTypes = lodash_1.default.merge(optionalTypes, { Multisig: EIP712_1.EIP712.types.multisig });
            additionalTypesInPrimary.push({ name: "multisig", type: "Multisig" });
        }
        if (this.FCT.computed.length > 0) {
            optionalTypes = lodash_1.default.merge(optionalTypes, { Computed: EIP712_1.EIP712.types.computed });
        }
        return {
            EIP712Domain: EIP712_1.EIP712.types.domain,
            Meta: EIP712_1.EIP712.types.meta,
            Limits: EIP712_1.EIP712.types.limits,
            ...optionalTypes,
            ...transactionTypes,
            ...structTypes,
            BatchMultiSigCall: this.getPrimaryTypeTypes(additionalTypesInPrimary),
            Call: EIP712_1.EIP712.types.call,
        };
    }
    getTypedDataDomain() {
        return this.FCT.domain;
    }
    getPrimaryType() {
        return "BatchMultiSigCall";
    }
    getPrimaryTypeTypes(additionalTypes) {
        return [
            { name: "meta", type: "Meta" },
            { name: "limits", type: "Limits" },
            ...additionalTypes,
            ...this.getComputedPrimaryType(),
            ...this.getCallsPrimaryType(),
        ];
    }
    getCallsPrimaryType() {
        return this.calls.map((_, index) => ({
            name: `transaction_${index + 1}`,
            type: `transaction${index + 1}`,
        }));
    }
    getComputedPrimaryType() {
        return this.FCT.computed.map((_, index) => ({
            name: `computed_${index + 1}`,
            type: `Computed`,
        }));
    }
    getTransactionTypedDataMessage() {
        return this.calls.reduce((acc, call, index) => {
            let paramsData = {};
            if (call.params) {
                paramsData = helpers.getParams(call.params);
            }
            const options = call.options || {};
            const gasLimit = options.gasLimit ?? "0";
            const flow = options.flow ? constants_1.flows[options.flow].text : "continue on success, revert on fail";
            let jumpOnSuccess = 0;
            let jumpOnFail = 0;
            if (options.jumpOnSuccess && options.jumpOnSuccess !== constants_2.NO_JUMP) {
                const jumpOnSuccessIndex = this.calls.findIndex((c) => c.nodeId === options.jumpOnSuccess);
                if (jumpOnSuccessIndex === -1) {
                    throw new Error(`Jump on success node id ${options.jumpOnSuccess} not found`);
                }
                if (jumpOnSuccessIndex <= index) {
                    throw new Error(`Jump on success node id ${options.jumpOnSuccess} is current or before current node (${call.nodeId})`);
                }
                jumpOnSuccess = jumpOnSuccessIndex - index - 1;
            }
            if (options.jumpOnFail && options.jumpOnFail !== constants_2.NO_JUMP) {
                const jumpOnFailIndex = this.calls.findIndex((c) => c.nodeId === options.jumpOnFail);
                if (jumpOnFailIndex === -1) {
                    throw new Error(`Jump on fail node id ${options.jumpOnFail} not found`);
                }
                if (jumpOnFailIndex <= index) {
                    throw new Error(`Jump on fail node id ${options.jumpOnFail} is current or before current node (${call.nodeId})`);
                }
                jumpOnFail = jumpOnFailIndex - index - 1;
            }
            return {
                ...acc,
                [`transaction_${index + 1}`]: {
                    call: {
                        call_index: index + 1,
                        payer_index: index + 1,
                        call_type: call.options?.callType ? constants_1.CALL_TYPE_MSG[call.options.callType] : constants_1.CALL_TYPE_MSG.ACTION,
                        from: this.FCT.handleVariableValue(call.from, "address"),
                        to: this.FCT.handleVariableValue(call.to, "address"),
                        to_ens: call.toENS || "",
                        eth_value: this.FCT.handleVariableValue(call.to, "uint256", "0"),
                        gas_limit: gasLimit,
                        permissions: 0,
                        flow_control: flow,
                        returned_false_means_fail: options.falseMeansFail || false,
                        jump_on_success: jumpOnSuccess,
                        jump_on_fail: jumpOnFail,
                        method_interface: (0, helpers_1.handleMethodInterface)(call),
                    },
                    ...paramsData,
                },
            };
        }, {});
    }
}
exports.ExportFCT = ExportFCT;
ExportFCT.helpers = helpers;
