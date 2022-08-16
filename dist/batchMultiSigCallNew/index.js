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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BatchMultiSigCallNew = void 0;
const ethers_1 = require("ethers");
const ethers_eip712_1 = require("ethers-eip712");
const factoryProxy__abi_json_1 = __importDefault(require("../abi/factoryProxy_.abi.json"));
const helpers_1 = require("../helpers");
const helpers_2 = require("./helpers");
const variableBase = "0xFC00000000000000000000000000000000000000";
const FDBase = "0xFD00000000000000000000000000000000000000";
const FDBaseBytes = "0xFD00000000000000000000000000000000000000000000000000000000000000";
// DefaultFlag - "f100" // payment + eip712
const defaultFlags = {
    eip712: true,
    payment: true,
    flow: false,
};
class BatchMultiSigCallNew {
    constructor(provider, contractAddress) {
        this.calls = [];
        this.variables = [];
        // this.web3 = web3;
        this.provider = provider;
        this.FactoryProxy = new ethers_1.ethers.Contract(contractAddress, factoryProxy__abi_json_1.default, provider);
    }
    //
    // Everything for variables
    //
    createVariable(variableId, value) {
        this.variables = [...this.variables, [variableId, value !== null && value !== void 0 ? value : undefined]];
        return this.variables.map((item) => item[0]);
    }
    addVariableValue(variableId, value) {
        const index = this.getVariableIndex(variableId);
        this.variables[index][1] = value;
        return this.variables.map((item) => item[0]);
    }
    removeVariable(variableId) {
        return __awaiter(this, void 0, void 0, function* () {
            // Remove from variables
            this.variables = this.variables.filter((item) => item[0] !== variableId);
            // Adjust all calls to account for removed variable
            const allCalls = this.calls.map((call) => call.inputData);
            const data = yield Promise.all(allCalls.map((tx) => this.getMultiSigCallData(tx)));
            this.calls = data;
            return this.variables.map((item) => item[0]);
        });
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
    //
    // End of everything for variables
    //
    //
    // Handle FD
    //
    refTxValue(index, bytes = false) {
        return (index + 1).toString(16).padStart(bytes ? FDBaseBytes.length : FDBase.length, bytes ? FDBaseBytes : FDBase);
    }
    addExistingBatchCall(batchCall) {
        this.calls = [...this.calls, batchCall];
        return this.calls;
    }
    create(tx) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.getMultiSigCallData(tx);
            this.calls = [...this.calls, data];
            return data;
        });
    }
    createMultiple(txs) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield Promise.all(txs.map((tx) => this.getMultiSigCallData(tx)));
            this.calls = [...this.calls, ...data];
            return data;
        });
    }
    editBatchCall(index, tx) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.getMultiSigCallData(tx);
            this.calls[index] = data;
            return data;
        });
    }
    removeBatchCall(index) {
        return __awaiter(this, void 0, void 0, function* () {
            const restOfCalls = this.calls.slice(index + 1).map((call) => (Object.assign({}, call.inputData)));
            // Remove from calls
            this.calls.splice(index, 1);
            // Adjust nonce number for the rest of the calls
            const data = yield Promise.all(restOfCalls.map((tx) => this.getMultiSigCallData(tx)));
            this.calls.splice(-Math.abs(data.length), data.length, ...data);
            return this.calls;
        });
    }
    addMultiCallTx(indexOfBatch, tx) {
        return __awaiter(this, void 0, void 0, function* () {
            const batch = this.calls[indexOfBatch].inputData;
            if (!batch) {
                throw new Error(`Batch doesn't exist on index ${indexOfBatch}`);
            }
            batch.calls.push(tx);
            const data = yield this.getMultiSigCallData(batch);
            this.calls[indexOfBatch] = data;
            return data;
        });
    }
    editMultiCallTx(indexOfBatch, indexOfMulticall, tx) {
        return __awaiter(this, void 0, void 0, function* () {
            const batch = this.calls[indexOfBatch].inputData;
            if (!batch) {
                throw new Error(`Batch doesn't exist on index ${indexOfBatch}`);
            }
            batch.calls[indexOfMulticall] = tx;
            const data = yield this.getMultiSigCallData(batch);
            this.calls[indexOfBatch] = data;
            return data;
        });
    }
    removeMultiCallTx(indexOfBatch, indexOfMulticall) {
        return __awaiter(this, void 0, void 0, function* () {
            const batch = this.calls[indexOfBatch].inputData;
            if (!batch) {
                throw new Error(`Batch doesn't exist on index ${indexOfBatch}`);
            }
            batch.calls.splice(indexOfMulticall, 1);
            const data = yield this.getMultiSigCallData(batch);
            this.calls[indexOfBatch] = data;
            return data;
        });
    }
    getMultiSigCallData(batchCall) {
        return __awaiter(this, void 0, void 0, function* () {
            const self = this;
            let typedHashes = [];
            let additionalTypes = {};
            const salt = [...Array(6)].map(() => Math.floor(Math.random() * 16).toString(16)).join("");
            const version = "0x010101";
            const typedData = yield createTypedData(self, batchCall, additionalTypes, typedHashes, salt, version);
            const sessionId = (0, helpers_2.getSessionId)(salt, batchCall);
            const mcall = batchCall.calls.map((call, index) => {
                var _a;
                return ({
                    typeHash: ethers_1.ethers.utils.hexlify(ethers_eip712_1.TypedDataUtils.typeHash(typedData.types, typedData.types.BatchMultiSigCall[index + 1].type)),
                    functionSignature: (0, helpers_2.handleFunctionSignature)(call),
                    value: call.value,
                    from: ethers_1.utils.isAddress(call.from) ? call.from : this.getVariableFCValue(call.from),
                    gasLimit: (_a = call.gasLimit) !== null && _a !== void 0 ? _a : 0,
                    flags: (0, helpers_1.manageCallFlagsV2)(call.flow || "OK_CONT_FAIL_REVERT", call.jump || 0),
                    to: (0, helpers_2.handleTo)(self, call),
                    ensHash: (0, helpers_2.handleEnsHash)(call),
                    data: (0, helpers_2.handleData)(call),
                    types: (0, helpers_2.handleTypes)(call),
                    typedHashes: (0, helpers_2.handleTypedHashes)(call, typedData),
                });
            });
            return {
                typedData,
                typeHash: ethers_1.ethers.utils.hexlify(ethers_eip712_1.TypedDataUtils.typeHash(typedData.types, typedData.primaryType)),
                sessionId,
                inputData: batchCall,
                name: batchCall.name || "BatchMultiSigCall transaction",
                mcall,
                addCall: function (tx, index) {
                    return __awaiter(this, void 0, void 0, function* () {
                        if (index) {
                            const length = this.inputData.calls.length;
                            if (index > length) {
                                throw new Error(`Index ${index} is out of bounds.`);
                            }
                            this.inputData.calls.splice(index, 0, tx);
                        }
                        else {
                            this.inputData.calls.push(tx);
                        }
                        const data = yield self.getMultiSigCallData(this.inputData);
                        this.typedData = data.typedData;
                        this.typeHash = data.typeHash;
                        this.sessionId = data.sessionId;
                        this.mcall = data.mcall;
                        return data;
                    });
                },
                replaceCall: function (tx, index) {
                    return __awaiter(this, void 0, void 0, function* () {
                        if (index >= this.inputData.calls.length) {
                            throw new Error(`Index ${index} is out of bounds.`);
                        }
                        const prevCall = this.inputData.calls[index];
                        this.inputData.calls[index] = tx;
                        const data = yield self.getMultiSigCallData(this.inputData);
                        this.typedData = data.typedData;
                        this.typeHash = data.typeHash;
                        this.sessionId = data.sessionId;
                        this.mcall = data.mcall;
                        return prevCall;
                    });
                },
                removeCall: function (index) {
                    return __awaiter(this, void 0, void 0, function* () {
                        if (index >= this.inputData.calls.length) {
                            throw new Error(`Index ${index} is out of bounds.`);
                        }
                        const prevCall = this.inputData.calls[index];
                        this.inputData.calls.splice(index, 1);
                        const data = yield self.getMultiSigCallData(this.inputData);
                        this.typedData = data.typedData;
                        this.typeHash = data.typeHash;
                        this.sessionId = data.sessionId;
                        this.mcall = data.mcall;
                        return prevCall;
                    });
                },
                getCall: function (index) {
                    return this.mcall[index];
                },
                get length() {
                    return this.mcall.length;
                },
            };
        });
    }
}
exports.BatchMultiSigCallNew = BatchMultiSigCallNew;
const verifyParams = (self, params, index, additionalTypes, typedHashes) => {
    params.forEach((param) => {
        if (param.variable) {
            param.value = self.getVariableFCValue(param.variable);
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
};
const getParams = (self, call) => {
    // If call has parameters
    if (call.params) {
        // If mcall is a validation call
        if (call.validator) {
            Object.entries(call.validator.params).forEach(([key, value]) => {
                const index = self.getVariableIndex(value, false);
                if (index !== -1) {
                    call.validator.params[key] = self.getVariableFCValue(self.variables[index][0]);
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
                            item2.value = self.getVariableFCValue(item2.variable);
                        }
                        return Object.assign(Object.assign({}, acc), { [item2.name]: item2.value });
                    }, {}));
                }
                else {
                    // If parameter is a custom type
                    const valueArray = param.value;
                    value = valueArray.reduce((acc, item) => {
                        if (item.variable) {
                            item.value = self.getVariableFCValue(item.variable);
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
};
const createTypedData = (self, batchCall, additionalTypes, typedHashes, salt, version) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    // Creates messages from multiCalls array for EIP712 sign
    const typedDataMessage = batchCall.calls.reduce((acc, call, index) => {
        // Update params if variables (FC) or references (FD) are used
        let paramsData = {};
        if (call.params) {
            verifyParams(self, call.params, index, additionalTypes, typedHashes);
            paramsData = { params: getParams(self, call) };
        }
        return Object.assign(Object.assign({}, acc), { [`transaction${index + 1}`]: Object.assign({ call: {
                    from: ethers_1.utils.isAddress(call.from) ? call.from : self.getVariableFCValue(call.from),
                    to: (0, helpers_2.handleTo)(self, call),
                    to_ens: call.toEnsHash || "",
                    eth_value: call.value,
                    gas_limit: call.gasLimit || 0,
                    view_only: call.viewOnly || false,
                    flow_control: call.flow ? helpers_1.flows[call.flow].text : "continue on success, revert on fail",
                    jump_over: call.jump || 0,
                    method_interface: (0, helpers_2.handleMethodInterface)(call),
                } }, paramsData) });
    }, {});
    let optionalMessage = {};
    let optionalTypes = {};
    let primaryType = [];
    if (batchCall.recurrency) {
        optionalMessage = {
            recurrency: {
                max_repeats: batchCall.recurrency.maxRepeats,
                chill_time: batchCall.recurrency.chillTime,
                accumetable: batchCall.recurrency.accumetable,
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
    if (batchCall.multisig) {
        optionalMessage = Object.assign(Object.assign({}, optionalMessage), { multisig: {
                external_signers: batchCall.multisig.externalSigners,
                minimum_approvals: batchCall.multisig.minimumApprovals,
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
                ...batchCall.calls.map((_, index) => ({
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
            ] }), batchCall.calls.reduce((acc, call, index) => (Object.assign(Object.assign({}, acc), { [`Transaction${index + 1}`]: [
                { name: "call", type: "Transaction" },
                { name: "params", type: `Transaction${index + 1}_Params` },
            ], [`Transaction${index + 1}_Params`]: call.params.map((param) => ({ name: param.name, type: param.type })) })), {})), additionalTypes),
        primaryType: "BatchMultiSigCall",
        domain: yield (0, helpers_1.getTypedDataDomain)(self.FactoryProxy),
        message: Object.assign(Object.assign({ info: {
                name: batchCall.name || "BatchMultiSigCall transaction",
                version,
                random_id: `0x${salt}`,
                eip712: true,
            }, limits: {
                valid_from: (_a = batchCall.validFrom) !== null && _a !== void 0 ? _a : 0,
                expires_at: (_b = batchCall.expiresAt) !== null && _b !== void 0 ? _b : 0,
                gas_price_limit: (_c = batchCall.gasPriceLimit) !== null && _c !== void 0 ? _c : "25000000000",
                cancelable: batchCall.cancelable || true,
            } }, optionalMessage), typedDataMessage),
    };
    return typedData;
});
