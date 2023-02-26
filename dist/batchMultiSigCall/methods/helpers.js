"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeParams = exports.handleValue = exports.handleTo = exports.getParamsFromCall = exports.createTypedData = exports.setOptions = exports.getAllRequiredApprovals = exports.getCalldataForActuator = void 0;
const ki_eth_fct_provider_ts_1 = require("@kirobo/ki-eth-fct-provider-ts");
const lodash_1 = __importDefault(require("lodash"));
const constants_1 = require("../../constants");
const helpers_1 = require("../../helpers");
const helpers_2 = require("../helpers");
function getCalldataForActuator({ signedFCT, purgedFCT, investor, activator, version, }) {
    return this.FCT_BatchMultiSigCall.encodeFunctionData("batchMultiSigCall", [
        `0x${version}`.padEnd(66, "0"),
        signedFCT,
        purgedFCT,
        investor,
        activator,
    ]);
}
exports.getCalldataForActuator = getCalldataForActuator;
function getAllRequiredApprovals() {
    let requiredApprovals = [];
    if (!this.chainId) {
        throw new Error("No chainId or provider has been set");
    }
    const chainId = this.chainId;
    for (const call of this.calls) {
        if (typeof call.to !== "string") {
            continue;
        }
        const pluginData = (0, ki_eth_fct_provider_ts_1.getPlugin)({
            signature: (0, helpers_2.handleFunctionSignature)(call),
            address: call.to,
            chainId,
        });
        if (pluginData) {
            const initPlugin = new pluginData.plugin({ chainId });
            const methodParams = call.params
                ? call.params.reduce((acc, param) => {
                    acc[param.name] = param.value;
                    return acc;
                }, {})
                : {};
            initPlugin.input.set({
                to: call.to,
                methodParams,
            });
            const approvals = initPlugin.getRequiredApprovals();
            if (approvals.length > 0 && typeof call.from === "string") {
                const manageValue = (value) => {
                    if ((0, helpers_1.instanceOfVariable)(value) || !value) {
                        return "";
                    }
                    if (value === constants_1.FCT_VAULT_ADDRESS && typeof call.from === "string") {
                        return call.from;
                    }
                    return value;
                };
                const requiredApprovalsWithFrom = approvals
                    .filter((approval) => {
                    return Object.values(approval).every((value) => typeof value !== "undefined");
                })
                    .map((approval) => {
                    // If method is approve
                    if (approval.method === "approve") {
                        const data = {
                            token: manageValue(approval.to),
                            method: approval.method,
                            from: manageValue(approval.from || call.from),
                        };
                        if (approval.protocol === "ERC20") {
                            return {
                                ...data,
                                protocol: approval.protocol,
                                params: {
                                    spender: manageValue(approval.params[0]),
                                    amount: approval.params[1],
                                },
                            };
                        }
                        else if (approval.protocol === "ERC721") {
                            return {
                                ...data,
                                protocol: approval.protocol,
                                params: {
                                    spender: manageValue(approval.params[0]),
                                    tokenId: approval.params[1],
                                },
                            };
                        }
                    }
                    if (approval.method === "setApprovalForAll" &&
                        (approval.protocol === "ERC721" || approval.protocol === "ERC1155")) {
                        return {
                            protocol: approval.protocol,
                            token: manageValue(approval.to),
                            method: approval.method,
                            params: {
                                spender: manageValue(approval.params[0]),
                                approved: approval.params[1],
                            },
                            from: manageValue(approval.from || call.from),
                        };
                    }
                    throw new Error("Unknown method for plugin");
                });
                requiredApprovals = [...requiredApprovals, ...requiredApprovalsWithFrom];
            }
        }
    }
    return requiredApprovals;
}
exports.getAllRequiredApprovals = getAllRequiredApprovals;
function setOptions(options) {
    const mergedOptions = lodash_1.default.merge({ ...this._options }, options);
    (0, helpers_2.verifyOptions)(mergedOptions);
    this._options = mergedOptions;
    return this.options;
}
exports.setOptions = setOptions;
function createTypedData(salt, version) {
    const typedDataMessage = this.decodedCalls.reduce((acc, call, index) => {
        let paramsData = {};
        if (call.params) {
            paramsData = this.getParamsFromCall(call);
        }
        const options = call.options || {};
        const gasLimit = options.gasLimit ?? "0";
        const flow = options.flow ? constants_1.flows[options.flow].text : "continue on success, revert on fail";
        let jumpOnSuccess = 0;
        let jumpOnFail = 0;
        if (options.jumpOnSuccess && options.jumpOnSuccess !== index_1.NO_JUMP) {
            const jumpOnSuccessIndex = this.calls.findIndex((c) => c.nodeId === options.jumpOnSuccess);
            if (jumpOnSuccessIndex === -1) {
                throw new Error(`Jump on success node id ${options.jumpOnSuccess} not found`);
            }
            if (jumpOnSuccessIndex <= index) {
                throw new Error(`Jump on success node id ${options.jumpOnSuccess} is current or before current node (${call.nodeId})`);
            }
            jumpOnSuccess = jumpOnSuccessIndex - index - 1;
        }
        if (options.jumpOnFail && options.jumpOnFail !== index_1.NO_JUMP) {
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
                    from: typeof call.from === "string" ? call.from : this.getVariable(call.from, "address"),
                    to: this.handleTo(call),
                    to_ens: call.toENS || "",
                    eth_value: this.handleValue(call),
                    gas_limit: gasLimit,
                    permissions: 0,
                    flow_control: flow,
                    returned_false_means_fail: options.falseMeansFail || false,
                    jump_on_success: jumpOnSuccess,
                    jump_on_fail: jumpOnFail,
                    method_interface: (0, helpers_2.handleMethodInterface)(call),
                },
                ...paramsData,
            },
        };
    }, {});
    const FCTOptions = this.options;
    const { recurrency, multisig } = FCTOptions;
    let optionalMessage = {};
    let optionalTypes = {};
    const primaryType = [];
    if (Number(recurrency.maxRepeats) > 1) {
        optionalMessage = lodash_1.default.merge(optionalMessage, {
            recurrency: {
                max_repeats: recurrency.maxRepeats,
                chill_time: recurrency.chillTime,
                accumetable: recurrency.accumetable,
            },
        });
        optionalTypes = lodash_1.default.merge(optionalTypes, { Recurrency: index_1.EIP712_RECURRENCY });
        primaryType.push({ name: "recurrency", type: "Recurrency" });
    }
    if (multisig.externalSigners.length > 0) {
        optionalMessage = lodash_1.default.merge(optionalMessage, {
            multisig: {
                external_signers: multisig.externalSigners,
                minimum_approvals: multisig.minimumApprovals || "2",
            },
        });
        optionalTypes = lodash_1.default.merge(optionalTypes, { Multisig: index_1.EIP712_MULTISIG });
        primaryType.push({ name: "multisig", type: "Multisig" });
    }
    const { structTypes, txTypes } = (0, helpers_2.getTxEIP712Types)(this.calls);
    const typedData = {
        types: {
            EIP712Domain: [
                { name: "name", type: "string" },
                { name: "version", type: "string" },
                { name: "chainId", type: "uint256" },
                { name: "verifyingContract", type: "address" },
                { name: "salt", type: "bytes32" },
            ],
            BatchMultiSigCall: [
                { name: "meta", type: "Meta" },
                { name: "limits", type: "Limits" },
                ...primaryType,
                ...this.computedVariables.map((_, index) => ({
                    name: `computed_${index + 1}`,
                    type: `Computed`,
                })),
                ...this.calls.map((_, index) => ({
                    name: `transaction_${index + 1}`,
                    type: `transaction${index + 1}`,
                })),
            ],
            Meta: [
                { name: "name", type: "string" },
                { name: "builder", type: "address" },
                { name: "selector", type: "bytes4" },
                { name: "version", type: "bytes3" },
                { name: "random_id", type: "bytes3" },
                { name: "eip712", type: "bool" },
                { name: "auth_enabled", type: "bool" },
            ],
            Limits: [
                { name: "valid_from", type: "uint40" },
                { name: "expires_at", type: "uint40" },
                { name: "gas_price_limit", type: "uint64" },
                { name: "purgeable", type: "bool" },
                { name: "blockable", type: "bool" },
            ],
            ...optionalTypes,
            ...txTypes,
            ...structTypes,
            ...(this.computedVariables.length > 0
                ? {
                    Computed: [
                        { name: "index", type: "uint256" },
                        { name: "var", type: "uint256" },
                        { name: "add", type: "uint256" },
                        { name: "sub", type: "uint256" },
                        { name: "mul", type: "uint256" },
                        { name: "div", type: "uint256" },
                    ],
                }
                : {}),
            Call: [
                { name: "call_index", type: "uint16" },
                { name: "payer_index", type: "uint16" },
                { name: "call_type", type: "string" },
                { name: "from", type: "address" },
                { name: "to", type: "address" },
                { name: "to_ens", type: "string" },
                { name: "eth_value", type: "uint256" },
                { name: "gas_limit", type: "uint32" },
                { name: "permissions", type: "uint16" },
                { name: "flow_control", type: "string" },
                { name: "returned_false_means_fail", type: "bool" },
                { name: "jump_on_success", type: "uint16" },
                { name: "jump_on_fail", type: "uint16" },
                { name: "method_interface", type: "string" },
            ],
        },
        primaryType: "BatchMultiSigCall",
        // domain: getTypedDataDomain(this.chainId),
        domain: this.domain,
        message: {
            meta: {
                name: this.options.name || "",
                builder: this.options.builder || "0x0000000000000000000000000000000000000000",
                selector: this.batchMultiSigSelector,
                version,
                random_id: `0x${salt}`,
                eip712: true,
                auth_enabled: this.options.authEnabled || true,
            },
            limits: {
                valid_from: this.options.validFrom,
                expires_at: this.options.expiresAt,
                gas_price_limit: this.options.maxGasPrice,
                purgeable: this.options.purgeable,
                blockable: this.options.blockable,
            },
            ...optionalMessage,
            ...(0, helpers_2.getComputedVariableMessage)(this.computedVariables),
            ...typedDataMessage,
        },
    };
    return typedData;
}
exports.createTypedData = createTypedData;
function getParamsFromCall(call, index) {
    // If call has parameters
    if (call.params) {
        const getParams = (params) => {
            return {
                ...params.reduce((acc, param) => {
                    let value;
                    // If parameter is a custom type (struct)
                    if (param.customType || param.type.includes("tuple")) {
                        if (param.type.lastIndexOf("[") > 0) {
                            const valueArray = param.value;
                            value = valueArray.map((item) => getParams(item));
                        }
                        else {
                            const valueArray = param.value;
                            value = getParams(valueArray);
                        }
                    }
                    else {
                        try {
                            (0, helpers_2.verifyParam)(param);
                        }
                        catch (err) {
                            if (err instanceof Error) {
                                throw new Error(`Error in call ${index + 1}: ${err.message}`);
                            }
                        }
                        value = param.value;
                    }
                    return {
                        ...acc,
                        [param.name]: value,
                    };
                }, {}),
            };
        };
        return getParams(call.params);
    }
    return {};
}
exports.getParamsFromCall = getParamsFromCall;
function handleTo(call) {
    if (typeof call.to === "string") {
        return call.to;
    }
    // Else it is a variable
    return this.getVariable(call.to, "address");
}
exports.handleTo = handleTo;
function handleValue(call) {
    // If value isn't provided => 0
    if (!call.value) {
        return "0";
    }
    // Check if value is a number
    if (typeof call.value === "string") {
        return call.value;
    }
    // Else it is a variable
    return this.getVariable(call.value, "uint256");
}
exports.handleValue = handleValue;
function decodeParams(params) {
    return params.reduce((acc, param) => {
        if (param.type === "tuple" || param.customType) {
            if (param.type.lastIndexOf("[") > 0) {
                const value = param.value;
                const decodedValue = value.map((tuple) => this.decodeParams(tuple));
                return [...acc, { ...param, value: decodedValue }];
            }
            const value = this.decodeParams(param.value);
            return [...acc, { ...param, value }];
        }
        if ((0, helpers_1.instanceOfVariable)(param.value)) {
            const value = this.getVariable(param.value, param.type);
            const updatedParam = { ...param, value };
            return [...acc, updatedParam];
        }
        return [...acc, param];
    }, []);
}
exports.decodeParams = decodeParams;
