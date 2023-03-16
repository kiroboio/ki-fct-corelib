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
exports.EIP712 = void 0;
const lodash_1 = __importDefault(require("lodash"));
const constants_1 = require("../../../constants");
const constants_2 = require("../../constants");
const helpers_1 = require("../../helpers");
const EIP712StructTypes_1 = require("../EIP712StructTypes");
const FCTBase_1 = require("../FCTBase");
const constants_3 = require("./constants");
const helpers = __importStar(require("./helpers"));
const TYPED_DATA_DOMAIN = {
    "1": {
        name: "FCT Controller",
        version: "1",
        chainId: 1,
        verifyingContract: "0x0A0ea58E6504aA7bfFf6F3d069Bd175AbAb638ee",
        salt: "0x0100c3ae8d91c3ffd32800000a0ea58e6504aa7bfff6f3d069bd175abab638ee",
    },
    "5": {
        name: "FCT Controller",
        version: "1",
        chainId: 5,
        verifyingContract: "0x38B5249Ec6529F19aee7CE2c650CadD407a78Ed7",
        salt: "0x01004130db7959f5983e000038b5249ec6529f19aee7ce2c650cadd407a78ed7",
    },
};
const types = {
    domain: constants_3.EIP712Domain,
    meta: constants_3.Meta,
    limits: constants_3.Limits,
    computed: constants_3.Computed,
    call: constants_3.Call,
    recurrency: constants_3.Recurrency,
    multisig: constants_3.Multisig,
};
class EIP712 extends FCTBase_1.FCTBase {
    constructor(FCT) {
        super(FCT);
    }
    static getTypedDataDomain(chainId) {
        return TYPED_DATA_DOMAIN[chainId];
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
                version: this.FCT.version,
                random_id: `0x${this.FCT.randomId}`,
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
            ...(0, helpers_1.getComputedVariableMessage)(this.FCT.computedWithValues),
            ...transactionTypedData,
        };
    }
    getTypedDataTypes() {
        const { structTypes, transactionTypes } = new EIP712StructTypes_1.EIP712StructTypes(this.FCT.calls);
        const FCTOptions = this.FCT.options;
        const { recurrency, multisig } = FCTOptions;
        let optionalTypes = {};
        const additionalTypesInPrimary = [];
        if (Number(recurrency.maxRepeats) > 1) {
            optionalTypes = lodash_1.default.merge(optionalTypes, { Recurrency: EIP712.types.recurrency });
            additionalTypesInPrimary.push({ name: "recurrency", type: "Recurrency" });
        }
        if (multisig.externalSigners.length > 0) {
            optionalTypes = lodash_1.default.merge(optionalTypes, { Multisig: EIP712.types.multisig });
            additionalTypesInPrimary.push({ name: "multisig", type: "Multisig" });
        }
        if (this.FCT.computed.length > 0) {
            optionalTypes = lodash_1.default.merge(optionalTypes, { Computed: EIP712.types.computed });
        }
        return {
            EIP712Domain: EIP712.types.domain,
            Meta: EIP712.types.meta,
            Limits: EIP712.types.limits,
            ...optionalTypes,
            ...transactionTypes,
            ...structTypes,
            BatchMultiSigCall: this.getPrimaryTypeTypes(additionalTypesInPrimary),
            Call: EIP712.types.call,
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
        return this.FCT.calls.map((_, index) => ({
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
        return this.FCT.decodedCalls.reduce((acc, call, index) => {
            const paramsData = call.params ? helpers.getParams(call.params) : {};
            const options = call.options || {};
            const gasLimit = options.gasLimit ?? "0";
            const flow = options.flow ? constants_1.flows[options.flow].text : "continue on success, revert on fail";
            let jumpOnSuccess = 0;
            let jumpOnFail = 0;
            if (options.jumpOnSuccess && options.jumpOnSuccess !== constants_2.NO_JUMP) {
                const jumpOnSuccessIndex = this.FCT.calls.findIndex((c) => c.nodeId === options.jumpOnSuccess);
                if (jumpOnSuccessIndex === -1) {
                    throw new Error(`Jump on success node id ${options.jumpOnSuccess} not found`);
                }
                if (jumpOnSuccessIndex <= index) {
                    throw new Error(`Jump on success node id ${options.jumpOnSuccess} is current or before current node (${call.nodeId})`);
                }
                jumpOnSuccess = jumpOnSuccessIndex - index - 1;
            }
            if (options.jumpOnFail && options.jumpOnFail !== constants_2.NO_JUMP) {
                const jumpOnFailIndex = this.FCT.calls.findIndex((c) => c.nodeId === options.jumpOnFail);
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
                        from: this.FCT._variables.getValue(call.from, "address"),
                        to: this.FCT._variables.getValue(call.to, "address"),
                        to_ens: call.toENS || "",
                        eth_value: this.FCT._variables.getValue(call.value, "uint256", "0"),
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
exports.EIP712 = EIP712;
EIP712.types = types;
