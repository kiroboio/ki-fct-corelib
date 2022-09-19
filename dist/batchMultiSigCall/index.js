"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BatchMultiSigCall = void 0;
const ethers_1 = require("ethers");
const ethers_eip712_1 = require("ethers-eip712");
const FCT_Controller_abi_json_1 = __importDefault(require("../abi/FCT_Controller.abi.json"));
const FCT_Actuator_abi_json_1 = __importDefault(require("../abi/FCT_Actuator.abi.json"));
const helpers_1 = require("../helpers");
const helpers_2 = require("./helpers");
const utils_1 = require("ethers/lib/utils");
const constants_1 = require("../constants");
function getDate(days = 0) {
    const result = new Date();
    result.setDate(result.getDate() + days);
    return Number(result.getTime() / 1000).toFixed();
}
const variableBase = "0xFC00000000000000000000000000000000000000";
const FDBase = "0xFD00000000000000000000000000000000000000";
const FDBaseBytes = "0xFD00000000000000000000000000000000000000000000000000000000000000";
class BatchMultiSigCall {
    constructor({ provider, contractAddress, options, }) {
        this.batchMultiSigSelector = "0xa7973c1f";
        this.options = {
            maxGasPrice: "100000000000",
            validFrom: getDate(),
            expiresAt: getDate(7),
            purgeable: false,
            blockable: true,
            builder: "0x0000000000000000000000000000000000000000",
        };
        this.variables = [];
        this.calls = [];
        // Helpers
        this.getCalldataForActuator = async (actuatorAddress, signedFCTs, listOfPurgedFCTs = []) => {
            const version = "010101";
            const actuator = new ethers_1.ethers.Contract(actuatorAddress, FCT_Actuator_abi_json_1.default, this.provider);
            const nonce = BigInt(await actuator.s_nonces(this.batchMultiSigSelector + version.slice(0, 2).padEnd(56, "0")));
            const activateId = "0x" + version + "0".repeat(34) + (nonce + BigInt("1")).toString(16).padStart(16, "0") + "0".repeat(8);
            return this.FCT_BatchMultiSigCall.interface.encodeFunctionData("batchMultiSigCall", [
                activateId,
                signedFCTs,
                listOfPurgedFCTs,
            ]);
        };
        this.handleTo = (call) => {
            // If call is a validator method, return validator address as to address
            if (call.validator) {
                return call.validator.validatorAddress;
            }
            // Check if to is a valid address
            if (ethers_1.utils.isAddress(call.to)) {
                return call.to;
            }
            // Else it is a variable
            return this.getVariableValue(call.to);
        };
        this.handleValue = (call) => {
            // If value isn't provided => 0
            if (!call.value) {
                return "0";
            }
            // Check if value is a number
            if (!isNaN(call.value)) {
                return call.value;
            }
            // Else it is a variable
            return this.getVariableValue(call.value);
        };
        this.FCT_BatchMultiSigCall = new ethers_1.ethers.Contract(contractAddress, FCT_Controller_abi_json_1.default, provider);
        this.provider = provider;
        this.options = {
            ...this.options,
            ...options,
        };
    }
    // Validate
    validate(call) {
        if (!ethers_1.utils.isAddress(call.from) && this.getVariableIndex(call.from) === -1) {
            throw new Error("From value is not an address");
        }
        if (ethers_1.BigNumber.from(call.value).lt(0)) {
            throw new Error("Value cannot be negative");
        }
        return true;
    }
    // Variables
    createVariable(variableId, value) {
        this.variables = [...this.variables, [variableId, value ?? undefined]];
        return this.variables.map((item) => item[0]);
    }
    addVariableValue(variableId, value) {
        const index = this.getVariableIndex(variableId);
        this.variables[index][1] = value;
        return this.variables.map((item) => item[0]);
    }
    getVariableIndex(variableId, throwError = true) {
        const index = this.variables.findIndex((item) => item[0] === variableId);
        if (index === -1 && throwError) {
            throw new Error(`Variable ${variableId} doesn't exist`);
        }
        return index;
    }
    getVariableValue(variableId) {
        const index = this.getVariableIndex(variableId);
        if (index === -1) {
            throw new Error(`Variable ${variableId} doesn't exist`);
        }
        return String(index + 1).padStart(variableBase.length, variableBase);
    }
    getCallOutput(index, bytes = false) {
        return (index + 1).toString(16).padStart(bytes ? FDBaseBytes.length : FDBase.length, bytes ? FDBaseBytes : FDBase);
    }
    getVariablesAsBytes32() {
        return this.variables.map((item) => {
            const value = item[1];
            if (value === undefined) {
                throw new Error(`Variable ${item[0]} doesn't have a value`);
            }
            if (isNaN(Number(value)) || ethers_1.utils.isAddress(value)) {
                return `0x${String(value).replace("0x", "").padStart(64, "0")}`;
            }
            return `0x${Number(value).toString(16).padStart(64, "0")}`;
        });
    }
    // End of variables
    //
    //
    // Options
    setOptions(options) {
        this.options = { ...this.options, ...options };
        return this.options;
    }
    // End of options
    //
    //
    // FCT functions
    // public getPlugin = async (
    //   dataOrIndex: MSCall | number
    // ): Promise<{ name: string; description: string; plugin: Plugin }> => {
    //   if (typeof dataOrIndex === "number") {
    //     const call = this.getCall(dataOrIndex);
    //     if (!call.method) {
    //       throw new Error("Method is required to get plugin");
    //     }
    //     const Plugin = getPlugin({ signature: getMethodInterface(call) });
    //     return Plugin;
    //   } else {
    //     const Plugins = getPlugins({ by: { methodInterfaceHash: dataOrIndex.functionSignature } });
    //     if (!Plugins || Plugins.length === 0) {
    //       throw new Error("No plugin found");
    //     }
    //     return Plugins[0];
    //   }
    // };
    // public getAllPlugins = (): { name: string; description: string; plugin: Plugin }[] => {
    //   return getPlugins({});
    // };
    async create(callInput, index) {
        let call;
        if ("plugin" in callInput) {
            const pluginCall = await callInput.plugin.create();
            call = { ...pluginCall, from: callInput.from, options: callInput.options };
        }
        else {
            if (!callInput.to) {
                throw new Error("To address is required");
            }
            call = { ...callInput };
        }
        if (index) {
            const length = this.calls.length;
            if (index > length) {
                throw new Error(`Index ${index} is out of bounds.`);
            }
            this.calls.splice(index, 0, call);
        }
        else {
            this.calls.push(call);
        }
        return this.calls;
    }
    async replaceCall(callInput, index) {
        if (index >= this.calls.length) {
            throw new Error(`Index ${index} is out of bounds.`);
        }
        let call;
        if ("plugin" in callInput) {
            const pluginCall = await callInput.plugin.create();
            call = { ...pluginCall, from: callInput.from, options: callInput.options };
        }
        else {
            if (!callInput.to) {
                throw new Error("To address is required");
            }
            call = { ...callInput };
        }
        this.calls[index] = call;
        return this.calls;
    }
    removeCall(index) {
        if (index >= this.calls.length) {
            throw new Error(`Index ${index} is out of bounds.`);
        }
        this.calls.splice(index, 1);
        return this.calls;
    }
    getCall(index) {
        return this.calls[index];
    }
    get length() {
        return this.calls.length;
    }
    async exportFCT() {
        if (this.calls.length === 0) {
            throw new Error("No calls added");
        }
        const typedHashes = [];
        const additionalTypes = {};
        const salt = [...Array(6)].map(() => Math.floor(Math.random() * 16).toString(16)).join("");
        const version = "0x010101";
        const typedData = await this.createTypedData(additionalTypes, typedHashes, salt, version);
        const sessionId = (0, helpers_2.getSessionId)(salt, this.options);
        const mcall = this.calls.map((call, index) => ({
            typeHash: ethers_1.ethers.utils.hexlify(ethers_eip712_1.TypedDataUtils.typeHash(typedData.types, `transaction${index + 1}`)),
            ensHash: (0, helpers_2.handleEnsHash)(call),
            functionSignature: (0, helpers_2.handleFunctionSignature)(call),
            value: this.handleValue(call),
            callId: (0, helpers_2.manageCallId)(call, index + 1),
            from: ethers_1.utils.isAddress(call.from) ? call.from : this.getVariableValue(call.from),
            to: this.handleTo(call),
            data: (0, helpers_2.handleData)(call),
            types: (0, helpers_2.handleTypes)(call),
            typedHashes: typedHashes
                ? typedHashes.map((hash) => ethers_1.ethers.utils.hexlify(ethers_eip712_1.TypedDataUtils.typeHash(typedData.types, hash)))
                : [],
        }));
        return {
            typedData,
            builder: this.options.builder,
            typeHash: ethers_1.ethers.utils.hexlify(ethers_eip712_1.TypedDataUtils.typeHash(typedData.types, typedData.primaryType)),
            sessionId,
            nameHash: (0, utils_1.id)(this.options.name || ""),
            mcall, // This is where are the MSCall[] are returned
        };
    }
    async importFCT(fct) {
        // Here we import FCT and add all the data inside BatchMultiSigCall
        const options = (0, helpers_2.parseSessionID)(fct.sessionId, fct.builder);
        this.setOptions(options);
        const typedData = fct.typedData;
        for (const [index, call] of fct.mcall.entries()) {
            const dataTypes = typedData.types[`transaction${index + 1}`].slice(1);
            const { meta } = typedData.message[`transaction_${index + 1}`];
            const decodedParams = new utils_1.AbiCoder().decode(dataTypes.map((type) => `${type.type} ${type.name}`), call.data);
            const params = dataTypes.map((t) => ({
                name: t.name,
                type: t.type,
                value: ethers_1.BigNumber.isBigNumber(decodedParams[t.name]) ? decodedParams[t.name].toString() : decodedParams[t.name],
            }));
            const getFlow = () => {
                const flow = Object.entries(helpers_1.flows).find(([, value]) => {
                    return value.text === meta.flow_control.toString();
                });
                return constants_1.Flow[flow[0]];
            };
            const callInput = {
                to: call.to,
                from: call.from,
                value: call.value,
                method: meta.method_interface.split("(")[0],
                params,
                toENS: meta.to_ens,
                viewOnly: meta.view_only,
                options: {
                    gasLimit: meta.gas_limit,
                    jumpOnSuccess: meta.jump_on_success,
                    jumpOnFail: meta.jump_on_fail,
                    flow: getFlow(),
                },
            };
            this.create(callInput);
        }
        return this.calls;
    }
    // End of main FCT functions
    //
    //
    // Helpers functions
    async createTypedData(additionalTypes, typedHashes, salt, version) {
        // Creates messages from multiCalls array for EIP712 sign
        const typedDataMessage = this.calls.reduce((acc, call, index) => {
            // Update params if variables (FC) or references (FD) are used
            let paramsData = {};
            if (call.params) {
                this.verifyParams(call.params, index, additionalTypes, typedHashes);
                paramsData = this.getParams(call);
            }
            const options = call.options || {};
            const gasLimit = options.gasLimit ?? 0;
            const flow = options.flow ? helpers_1.flows[options.flow].text : "continue on success, revert on fail";
            const jumpOnSuccess = options.jumpOnSuccess ?? 0;
            const jumpOnFail = options.jumpOnFail ?? 0;
            return {
                ...acc,
                [`transaction_${index + 1}`]: {
                    meta: {
                        call_index: index + 1,
                        payer_index: index + 1,
                        from: ethers_1.utils.isAddress(call.from) ? call.from : this.getVariableValue(call.from),
                        to: this.handleTo(call),
                        to_ens: call.toENS || "",
                        eth_value: call.value || "0",
                        gas_limit: gasLimit,
                        view_only: call.viewOnly || false,
                        permissions: 0,
                        flow_control: flow,
                        jump_on_success: jumpOnSuccess,
                        jump_on_fail: jumpOnFail,
                        method_interface: (0, helpers_2.handleMethodInterface)(call),
                    },
                    ...paramsData,
                },
            };
        }, {});
        let optionalMessage = {};
        let optionalTypes = {};
        const primaryType = [];
        if ("recurrency" in this.options) {
            optionalMessage = {
                recurrency: {
                    max_repeats: this.options?.recurrency?.maxRepeats || "1",
                    chill_time: this.options?.recurrency?.chillTime || "0",
                    accumetable: this.options?.recurrency?.accumetable || false,
                },
            };
            optionalTypes = {
                Recurrency: [
                    { name: "max_repeats", type: "uint16" },
                    { name: "chill_time", type: "uint32" },
                    { name: "accumetable", type: "bool" },
                ],
            };
            primaryType.push({ name: "recurrency", type: "Recurrency" });
        }
        if ("multisig" in this.options) {
            optionalMessage = {
                ...optionalMessage,
                multisig: {
                    external_signers: this.options?.multisig?.externalSigners,
                    minimum_approvals: this.options?.multisig?.minimumApprovals || 2,
                },
            };
            optionalTypes = {
                ...optionalTypes,
                Multisig: [
                    { name: "external_signers", type: "address[]" },
                    { name: "minimum_approvals", type: "uint8" },
                ],
            };
            primaryType.push({ name: "multisig", type: "Multisig" });
        }
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
                    { name: "fct", type: "FCT" },
                    { name: "limits", type: "Limits" },
                    ...this.calls.map((_, index) => ({
                        name: `transaction_${index + 1}`,
                        type: `transaction${index + 1}`,
                    })),
                ],
                FCT: [
                    { name: "name", type: "string" },
                    { name: "builder", type: "address" },
                    { name: "selector", type: "bytes4" },
                    { name: "version", type: "bytes3" },
                    { name: "random_id", type: "bytes3" },
                    { name: "eip712", type: "bool" },
                ],
                Limits: [
                    { name: "valid_from", type: "uint40" },
                    { name: "expires_at", type: "uint40" },
                    { name: "gas_price_limit", type: "uint64" },
                    { name: "purgeable", type: "bool" },
                    { name: "blockable", type: "bool" },
                ],
                ...optionalTypes,
                ...this.calls.reduce((acc, call, index) => ({
                    ...acc,
                    [`transaction${index + 1}`]: call.validator
                        ? [{ name: "meta", type: "Transaction" }, ...(0, helpers_1.getValidatorFunctionData)(call.validator, call.params)]
                        : [
                            { name: "meta", type: "Transaction" },
                            ...(call.params || []).map((param) => ({
                                name: param.name,
                                type: param.type,
                            })),
                        ],
                }), {}),
                ...additionalTypes,
                Transaction: [
                    { name: "call_index", type: "uint16" },
                    { name: "payer_index", type: "uint16" },
                    { name: "from", type: "address" },
                    { name: "to", type: "address" },
                    { name: "to_ens", type: "string" },
                    { name: "eth_value", type: "uint256" },
                    { name: "gas_limit", type: "uint32" },
                    { name: "view_only", type: "bool" },
                    { name: "permissions", type: "uint16" },
                    { name: "flow_control", type: "string" },
                    { name: "jump_on_success", type: "uint16" },
                    { name: "jump_on_fail", type: "uint16" },
                    { name: "method_interface", type: "string" },
                ],
            },
            primaryType: "BatchMultiSigCall",
            domain: await (0, helpers_1.getTypedDataDomain)(this.FCT_BatchMultiSigCall),
            message: {
                fct: {
                    name: this.options.name || "",
                    builder: this.options.builder,
                    selector: this.batchMultiSigSelector,
                    version,
                    random_id: `0x${salt}`,
                    eip712: true,
                },
                limits: {
                    valid_from: this.options.validFrom,
                    expires_at: this.options.expiresAt,
                    gas_price_limit: this.options.maxGasPrice,
                    purgeable: this.options.purgeable,
                    blockable: this.options.blockable,
                },
                ...optionalMessage,
                ...typedDataMessage,
            },
        };
        return typedData;
    }
    getParams(call) {
        // If call has parameters
        if (call.params) {
            // If mcall is a validation call
            if (call.validator) {
                Object.entries(call.validator.params).forEach(([key, value]) => {
                    const index = this.getVariableIndex(value, false);
                    if (index !== -1) {
                        call.validator.params[key] = this.getVariableValue(this.variables[index][0]);
                    }
                });
                return (0, helpers_1.createValidatorTxData)(call);
            }
            return {
                ...call.params.reduce((acc, param) => {
                    let value;
                    // If parameter is a custom type (struct)
                    if (param.customType) {
                        // If parameter is an array of custom types
                        if (param.type.lastIndexOf("[") > 0) {
                            const valueArray = param.value;
                            value = valueArray.map((item) => item.reduce((acc, item2) => {
                                if (item2.variable) {
                                    item2.value = this.getVariableValue(item2.variable);
                                }
                                return { ...acc, [item2.name]: item2.value };
                            }, {}));
                        }
                        else {
                            // If parameter is a custom type
                            const valueArray = param.value;
                            value = valueArray.reduce((acc, item) => {
                                if (item.variable) {
                                    item.value = this.getVariableValue(item.variable);
                                }
                                return { ...acc, [item.name]: item.value };
                            }, {});
                        }
                    }
                    else {
                        // If parameter isn't a struct/custom type
                        value = param.value;
                    }
                    return {
                        ...acc,
                        [param.name]: value,
                    };
                }, {}),
            };
        }
        return {};
    }
    async verifyParams(params, index, additionalTypes, typedHashes) {
        params.forEach((param) => {
            if (param.variable) {
                param.value = this.getVariableValue(param.variable);
                return;
            }
            // If parameter value is FD (reference value to previous tx)
            if (typeof param.value === "string" && param.value.includes("0xFD")) {
                const refIndex = parseInt(param.value.substring(param.value.length - 3), 16) - 1;
                // Checks if current transaction doesn't reference current or future transaction
                if (refIndex >= index) {
                    throw new Error(`Parameter ${param.name} references a future or current call, referencing call at position ${refIndex})`);
                }
                return;
            }
            if (param.customType) {
                if (additionalTypes[param.type]) {
                    return;
                }
                if (param.type.lastIndexOf("[") > 0) {
                    const type = param.type.slice(0, param.type.lastIndexOf("["));
                    typedHashes.push(type);
                    const arrayValue = param.value[0];
                    additionalTypes[type] = arrayValue.reduce((acc, item) => {
                        return [...acc, { name: item.name, type: item.type }];
                    }, []);
                }
                else {
                    const type = param.type;
                    typedHashes.push(type);
                    const arrayValue = param.value;
                    additionalTypes[type] = arrayValue.reduce((acc, item) => {
                        return [...acc, { name: item.name, type: item.type }];
                    }, []);
                }
            }
        });
    }
}
exports.BatchMultiSigCall = BatchMultiSigCall;
