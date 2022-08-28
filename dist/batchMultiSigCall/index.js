"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BatchMultiSigCall = void 0;
const ethers_1 = require("ethers");
const ethers_eip712_1 = require("ethers-eip712");
const factoryProxy__abi_json_1 = __importDefault(require("../abi/factoryProxy_.abi.json"));
const helpers_1 = require("../helpers");
const helpers_2 = require("./helpers");
// DefaultFlag - "f100" // payment + eip712
// const defaultFlags = {
//   eip712: true,
//   payment: true,
//   flow: false,
// };
const variableBase = "0xFC00000000000000000000000000000000000000";
const FDBase = "0xFD00000000000000000000000000000000000000";
const FDBaseBytes = "0xFD00000000000000000000000000000000000000000000000000000000000000";
class BatchMultiSigCall {
    constructor(provider, contractAddress) {
        this.options = {};
        this.variables = [];
        this.calls = [];
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
            return this.getVariableFCValue(call.to);
        };
        this.FactoryProxy = new ethers_1.ethers.Contract(contractAddress, factoryProxy__abi_json_1.default, provider);
    }
    // Validate
    validate(call) {
        if (!ethers_1.utils.isAddress(call.from) && this.getVariableIndex(call.from) === -1) {
            throw new Error("From value is not an address");
        }
        if (call.options && call.options.jump > 15) {
            throw new Error("Jump value cannot be higher than 15");
        }
        if (ethers_1.BigNumber.from(call.value).lt(0)) {
            throw new Error("Value cannot be negative");
        }
        return true;
    }
    // Variables
    createVariable(variableId, value) {
        this.variables = [...this.variables, [variableId, value !== null && value !== void 0 ? value : undefined]];
        return this.variables.map((item) => item[0]);
    }
    getVariableIndex(variableId, throwError = true) {
        const index = this.variables.findIndex((item) => item[0] === variableId);
        if (index === -1 && throwError) {
            throw new Error(`Variable ${variableId} doesn't exist`);
        }
        return index;
    }
    getVariableFCValue(variableId) {
        const index = this.getVariableIndex(variableId);
        return String(index + 1).padStart(variableBase.length, variableBase);
    }
    getCallValue(index, bytes = false) {
        return (index + 1).toString(16).padStart(bytes ? FDBaseBytes.length : FDBase.length, bytes ? FDBaseBytes : FDBase);
    }
    // End of variables
    //
    //
    // Options
    setOptions(options) {
        this.options = options;
        return this.options;
    }
    // End of options
    //
    //
    // FCT functions
    create(_a) {
        var { plugin, index } = _a, tx = __rest(_a, ["plugin", "index"]);
        let call;
        if (plugin) {
            const pluginCall = plugin.ref.create(plugin.params);
            call = Object.assign(Object.assign({}, pluginCall), tx);
        }
        else {
            call = Object.assign({}, tx);
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
    addCall(tx, index) {
        if (index) {
            const length = this.calls.length;
            if (index > length) {
                throw new Error(`Index ${index} is out of bounds.`);
            }
            this.calls.splice(index, 0, tx);
        }
        else {
            this.calls.push(tx);
        }
        return this.calls;
    }
    replaceCall(tx, index) {
        if (index >= this.calls.length) {
            throw new Error(`Index ${index} is out of bounds.`);
        }
        this.calls[index] = tx;
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
    getFCT() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.calls.length === 0) {
                throw new Error("No calls added");
            }
            let typedHashes = [];
            let additionalTypes = {};
            const salt = [...Array(6)].map(() => Math.floor(Math.random() * 16).toString(16)).join("");
            const version = "0x010101";
            const typedData = yield this.createTypedData(additionalTypes, typedHashes, salt, version);
            const sessionId = (0, helpers_2.getSessionId)(salt, this.options);
            const mcall = this.calls.map((call, index) => ({
                typeHash: ethers_1.ethers.utils.hexlify(ethers_eip712_1.TypedDataUtils.typeHash(typedData.types, typedData.types.BatchMultiSigCall[index + 1].type)),
                functionSignature: (0, helpers_2.handleFunctionSignature)(call),
                value: call.value,
                from: ethers_1.utils.isAddress(call.from) ? call.from : this.getVariableFCValue(call.from),
                gasLimit: (call.options && call.options.gasLimit) || 0,
                flags: (0, helpers_2.manageFlow)(call),
                to: this.handleTo(call),
                ensHash: (0, helpers_2.handleEnsHash)(call),
                data: (0, helpers_2.handleData)(call),
                types: (0, helpers_2.handleTypes)(call),
                typedHashes: typedHashes
                    ? typedHashes.map((hash) => ethers_1.ethers.utils.hexlify(ethers_eip712_1.TypedDataUtils.typeHash(typedData.types, hash)))
                    : [],
            }));
            return {
                typedData,
                typeHash: ethers_1.ethers.utils.hexlify(ethers_eip712_1.TypedDataUtils.typeHash(typedData.types, typedData.primaryType)),
                sessionId,
                name: this.options.name || "BatchMultiSigCall transaction",
                mcall, // This is where are the MSCall[] are returned
            };
        });
    }
    // End of main FCT functions
    //
    //
    // Helpers functions
    createTypedData(additionalTypes, typedHashes, salt, version) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            // Creates messages from multiCalls array for EIP712 sign
            const typedDataMessage = this.calls.reduce((acc, call, index) => {
                var _a, _b;
                // Update params if variables (FC) or references (FD) are used
                let paramsData = {};
                if (call.params) {
                    this.verifyParams(call.params, index, additionalTypes, typedHashes);
                    paramsData = { params: this.getParams(call) };
                }
                const options = call.options || {};
                const gasLimit = (_a = options.gasLimit) !== null && _a !== void 0 ? _a : 0;
                const flow = options.flow ? helpers_1.flows[options.flow].text : "continue on success, revert on fail";
                const jump = (_b = options.jump) !== null && _b !== void 0 ? _b : 0;
                return Object.assign(Object.assign({}, acc), { [`transaction${index + 1}`]: Object.assign({ call: {
                            from: ethers_1.utils.isAddress(call.from) ? call.from : this.getVariableFCValue(call.from),
                            to: this.handleTo(call),
                            to_ens: call.toEnsHash || "",
                            eth_value: call.value,
                            gas_limit: gasLimit,
                            view_only: call.viewOnly || false,
                            flow_control: flow,
                            jump_over: jump,
                            method_interface: (0, helpers_2.handleMethodInterface)(call),
                        } }, paramsData) });
            }, {});
            let optionalMessage = {};
            let optionalTypes = {};
            let primaryType = [];
            if ("recurrency" in this.options) {
                optionalMessage = {
                    recurrency: {
                        max_repeats: this.options.recurrency.maxRepeats,
                        chill_time: this.options.recurrency.chillTime,
                        accumetable: this.options.recurrency.accumetable,
                    },
                };
                optionalTypes = {
                    Recurrency: [
                        { name: "max_repeats", type: "uint16" },
                        { name: "chill_time", type: "uint32" },
                        { name: "accumetable", type: "bool" },
                    ],
                };
                primaryType = [{ name: "recurrency", type: "Recurrency" }];
            }
            if ("multisig" in this.options) {
                optionalMessage = Object.assign(Object.assign({}, optionalMessage), { multisig: {
                        external_signers: this.options.multisig.externalSigners,
                        minimum_approvals: this.options.multisig.minimumApprovals,
                    } });
                optionalTypes = Object.assign(Object.assign({}, optionalTypes), { Multisig: [
                        { name: "external_signers", type: "address[]" },
                        { name: "minimum_approvals", type: "uint8" },
                    ] });
                primaryType = [...primaryType, { name: "multisig", type: "Multisig" }];
            }
            const typedData = {
                types: Object.assign(Object.assign(Object.assign(Object.assign({ EIP712Domain: [
                        { name: "name", type: "string" },
                        { name: "version", type: "string" },
                        { name: "chainId", type: "uint256" },
                        { name: "verifyingContract", type: "address" },
                        { name: "salt", type: "bytes32" },
                    ], BatchMultiSigCall: [
                        { name: "info", type: "Info" },
                        { name: "limits", type: "Limits" },
                        ...this.calls.map((_, index) => ({
                            name: `transaction${index + 1}`,
                            type: `Transaction${index + 1}`,
                        })),
                    ], Info: [
                        { name: "name", type: "string" },
                        { name: "version", type: "bytes3" },
                        { name: "eip712", type: "bool" },
                        { name: "random_id", type: "bytes3" },
                    ], Limits: [
                        { name: "valid_from", type: "uint40" },
                        { name: "expires_at", type: "uint40" },
                        { name: "gas_price_limit", type: "uint64" },
                        { name: "cancelable", type: "bool" },
                    ] }, optionalTypes), { Transaction: [
                        { name: "from", type: "address" },
                        { name: "to", type: "address" },
                        { name: "to_ens", type: "string" },
                        { name: "eth_value", type: "uint256" },
                        { name: "gas_limit", type: "uint32" },
                        { name: "view_only", type: "bool" },
                        { name: "flow_control", type: "string" },
                        { name: "jump_over", type: "uint8" },
                        { name: "method_interface", type: "string" },
                    ] }), this.calls.reduce((acc, call, index) => (Object.assign(Object.assign({}, acc), { [`Transaction${index + 1}`]: [
                        { name: "call", type: "Transaction" },
                        { name: "params", type: `Transaction${index + 1}_Params` },
                    ], [`Transaction${index + 1}_Params`]: call.params.map((param) => ({ name: param.name, type: param.type })) })), {})), additionalTypes),
                primaryType: "BatchMultiSigCall",
                domain: yield (0, helpers_1.getTypedDataDomain)(this.FactoryProxy),
                message: Object.assign(Object.assign({ info: {
                        name: this.options.name || "BatchMultiSigCall transaction",
                        version,
                        random_id: `0x${salt}`,
                        eip712: true,
                    }, limits: {
                        valid_from: (_a = this.options.validFrom) !== null && _a !== void 0 ? _a : 0,
                        expires_at: (_b = this.options.expiresAt) !== null && _b !== void 0 ? _b : 0,
                        gas_price_limit: (_c = this.options.maxGasPrice) !== null && _c !== void 0 ? _c : "25000000000",
                        cancelable: this.options.cancelable || true,
                    } }, optionalMessage), typedDataMessage),
            };
            return typedData;
        });
    }
    getParams(call) {
        // If call has parameters
        if (call.params) {
            // If mcall is a validation call
            if (call.validator) {
                Object.entries(call.validator.params).forEach(([key, value]) => {
                    const index = this.getVariableIndex(value, false);
                    if (index !== -1) {
                        call.validator.params[key] = this.getVariableFCValue(this.variables[index][0]);
                    }
                });
                return (0, helpers_1.createValidatorTxData)(call);
            }
            return Object.assign({}, call.params.reduce((acc, param) => {
                let value;
                // If parameter is a custom type (struct)
                if (param.customType) {
                    // If parameter is an array of custom types
                    if (param.type.lastIndexOf("[") > 0) {
                        const valueArray = param.value;
                        value = valueArray.map((item) => item.reduce((acc, item2) => {
                            if (item2.variable) {
                                item2.value = this.getVariableFCValue(item2.variable);
                            }
                            return Object.assign(Object.assign({}, acc), { [item2.name]: item2.value });
                        }, {}));
                    }
                    else {
                        // If parameter is a custom type
                        const valueArray = param.value;
                        value = valueArray.reduce((acc, item) => {
                            if (item.variable) {
                                item.value = this.getVariableFCValue(item.variable);
                            }
                            return Object.assign(Object.assign({}, acc), { [item.name]: item.value });
                        }, {});
                    }
                }
                else {
                    // If parameter isn't a struct/custom type
                    value = param.value;
                }
                return Object.assign(Object.assign({}, acc), { [param.name]: value });
            }, {}));
        }
        return {};
    }
    verifyParams(params, index, additionalTypes, typedHashes) {
        return __awaiter(this, void 0, void 0, function* () {
            params.forEach((param) => {
                if (param.variable) {
                    param.value = this.getVariableFCValue(param.variable);
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
        });
    }
}
exports.BatchMultiSigCall = BatchMultiSigCall;
