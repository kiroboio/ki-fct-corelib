"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BatchMultiSigCall = void 0;
const ethers_1 = require("ethers");
const ethers_eip712_1 = require("ethers-eip712");
const utils_1 = require("ethers/lib/utils");
const FCT_Controller_abi_json_1 = __importDefault(require("../abi/FCT_Controller.abi.json"));
const helpers_1 = require("../helpers");
const variableBase = "0xFC00000000000000000000000000000000000000";
const FDBase = "0xFD00000000000000000000000000000000000000";
const FDBaseBytes = "0xFD00000000000000000000000000000000000000000000000000000000000000";
// DefaultFlag - "f100" // payment + eip712
const defaultFlags = {
    eip712: true,
    payment: true,
    flow: false,
};
class BatchMultiSigCall {
    constructor(provider, contractAddress) {
        this.calls = [];
        this.variables = [];
        // this.web3 = web3;
        this.provider = provider;
        this.FactoryProxy = new ethers_1.ethers.Contract(contractAddress, FCT_Controller_abi_json_1.default, provider);
    }
    //
    // Everything for variables
    //
    createVariable(variableId, value) {
        this.variables = [...this.variables, [variableId, value ?? undefined]];
        return this.variables.map((item) => item[0]);
    }
    addVariableValue(variableId, value) {
        const index = this.getVariableIndex(variableId);
        this.variables[index][1] = value;
        return this.variables.map((item) => item[0]);
    }
    async removeVariable(variableId) {
        // Remove from variables
        this.variables = this.variables.filter((item) => item[0] !== variableId);
        // Adjust all calls to account for removed variable
        const allCalls = this.calls.map((call) => call.inputData);
        const data = await Promise.all(allCalls.map((tx) => this.getMultiSigCallData(tx)));
        this.calls = data;
        return this.variables.map((item) => item[0]);
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
    async create(tx) {
        const data = await this.getMultiSigCallData(tx);
        this.calls = [...this.calls, data];
        return data;
    }
    async createMultiple(txs) {
        const data = await Promise.all(txs.map((tx) => this.getMultiSigCallData(tx)));
        this.calls = [...this.calls, ...data];
        return data;
    }
    async editBatchCall(index, tx) {
        const data = await this.getMultiSigCallData(tx);
        this.calls[index] = data;
        return data;
    }
    async removeBatchCall(index) {
        const restOfCalls = this.calls
            .slice(index + 1)
            .map((call) => ({ ...call.inputData, nonce: call.inputData.nonce - 1 }));
        // Remove from calls
        this.calls.splice(index, 1);
        // Adjust nonce number for the rest of the calls
        const data = await Promise.all(restOfCalls.map((tx) => this.getMultiSigCallData(tx)));
        this.calls.splice(-Math.abs(data.length), data.length, ...data);
        return this.calls;
    }
    async addMultiCallTx(indexOfBatch, tx) {
        const batch = this.calls[indexOfBatch].inputData;
        if (!batch) {
            throw new Error(`Batch doesn't exist on index ${indexOfBatch}`);
        }
        batch.calls.push(tx);
        const data = await this.getMultiSigCallData(batch);
        this.calls[indexOfBatch] = data;
        return data;
    }
    async editMultiCallTx(indexOfBatch, indexOfMulticall, tx) {
        const batch = this.calls[indexOfBatch].inputData;
        if (!batch) {
            throw new Error(`Batch doesn't exist on index ${indexOfBatch}`);
        }
        batch.calls[indexOfMulticall] = tx;
        const data = await this.getMultiSigCallData(batch);
        this.calls[indexOfBatch] = data;
        return data;
    }
    async removeMultiCallTx(indexOfBatch, indexOfMulticall) {
        const batch = this.calls[indexOfBatch].inputData;
        if (!batch) {
            throw new Error(`Batch doesn't exist on index ${indexOfBatch}`);
        }
        batch.calls.splice(indexOfMulticall, 1);
        const data = await this.getMultiSigCallData(batch);
        this.calls[indexOfBatch] = data;
        return data;
    }
    async getMultiSigCallData(batchCall) {
        const self = this;
        const callDetails = (0, helpers_1.getSessionIdDetails)(batchCall, defaultFlags, false);
        const typedHashes = [];
        const additionalTypes = {};
        // Creates messages from multiCalls array for EIP712 sign
        const typedDataMessage = batchCall.calls.reduce((acc, item, index) => {
            const txData = () => {
                // If mcall has parameters
                if (item.params) {
                    item.params.forEach((param) => {
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
                    // If mcall is a validation call
                    if (item.validator) {
                        Object.entries(item.validator.params).forEach(([key, value]) => {
                            const index = this.getVariableIndex(value, false);
                            if (index !== -1) {
                                item.validator.params[key] = this.getVariableFCValue(this.variables[index][0]);
                            }
                        });
                        return (0, helpers_1.createValidatorTxData)(item);
                    }
                    return {
                        ...item.params.reduce((acc, param) => {
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
                                        return { ...acc, [item2.name]: item2.value };
                                    }, {}));
                                }
                                else {
                                    // If parameter is a custom type
                                    const valueArray = param.value;
                                    value = valueArray.reduce((acc, item) => {
                                        if (item.variable) {
                                            item.value = this.getVariableFCValue(item.variable);
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
            };
            return {
                ...acc,
                [`transaction_${index + 1}`]: {
                    details: {
                        from: ethers_1.utils.isAddress(item.from) ? item.from : this.getVariableFCValue(item.from),
                        call_address: item.validator
                            ? item.validator.validatorAddress
                            : ethers_1.utils.isAddress(item.to)
                                ? item.to
                                : this.getVariableFCValue(item.to),
                        call_ens: item.toEnsHash || "",
                        eth_value: item.value,
                        gas_limit: item.gasLimit || Number.parseInt("0x" + callDetails.gasLimit),
                        view_only: item.viewOnly || false,
                        flow_control: item.flow ? helpers_1.flows[item.flow].text : "continue on success, revert on fail",
                        jump_over: item.jump || 0,
                        method_interface: item.method
                            ? item.validator
                                ? (0, helpers_1.getValidatorMethodInterface)(item.validator)
                                : (0, helpers_1.getMethodInterface)(item)
                            : "",
                    },
                    ...txData(),
                },
            };
        }, {});
        const typedData = {
            types: {
                EIP712Domain: [
                    { name: "name", type: "string" },
                    { name: "version", type: "string" },
                    { name: "chainId", type: "uint256" },
                    { name: "verifyingContract", type: "address" },
                    { name: "salt", type: "bytes32" },
                ],
                BatchMultiSigCall_: [
                    { name: "limits", type: "Limits_" },
                    ...batchCall.calls.map((_, index) => ({
                        name: `transaction_${index + 1}`,
                        type: `Transaction_${index + 1}`,
                    })),
                ],
                Limits_: [
                    { name: "nonce", type: "uint64" },
                    { name: "refund", type: "bool" },
                    { name: "valid_from", type: "uint40" },
                    { name: "expires_at", type: "uint40" },
                    { name: "gas_price_limit", type: "uint64" },
                ],
                Transaction_: [
                    { name: "from", type: "address" },
                    { name: "call_address", type: "address" },
                    { name: "call_ens", type: "string" },
                    { name: "eth_value", type: "uint256" },
                    { name: "gas_limit", type: "uint32" },
                    { name: "view_only", type: "bool" },
                    { name: "flow_control", type: "string" },
                    { name: "jump_over", type: "uint8" },
                    { name: "method_interface", type: "string" },
                ],
                ...batchCall.calls.reduce((acc, item, index) => ({
                    ...acc,
                    [`Transaction_${index + 1}`]: (0, helpers_1.generateTxType)(item),
                }), {}),
                ...additionalTypes,
            },
            primaryType: "BatchMultiSigCall_",
            domain: await (0, helpers_1.getTypedDataDomain)(this.FactoryProxy),
            message: {
                limits: {
                    nonce: "0x" + callDetails.group + callDetails.nonce,
                    refund: callDetails.pureFlags.payment,
                    valid_from: Number.parseInt("0x" + callDetails.after),
                    expires_at: Number.parseInt("0x" + callDetails.before),
                    gas_price_limit: Number.parseInt("0x" + callDetails.maxGasPrice),
                },
                ...typedDataMessage,
            },
        };
        const encodedMessage = ethers_1.ethers.utils.hexlify(ethers_eip712_1.TypedDataUtils.encodeData(typedData, typedData.primaryType, typedData.message));
        const encodedLimits = ethers_1.ethers.utils.hexlify(ethers_eip712_1.TypedDataUtils.encodeData(typedData, "Limits_", typedData.message.limits));
        const getEncodedMulticallData = (index) => {
            const encodedMessage = ethers_1.ethers.utils.hexlify(ethers_eip712_1.TypedDataUtils.encodeData(typedData, `Transaction_${index + 1}`, typedData.message[`transaction_${index + 1}`]));
            const encodedDetails = ethers_1.ethers.utils.hexlify(ethers_eip712_1.TypedDataUtils.encodeData(typedData, `Transaction_`, typedData.message[`transaction_${index + 1}`].details));
            return {
                encodedMessage,
                encodedDetails,
            };
        };
        const mcall = batchCall.calls.map((item, index) => ({
            typeHash: ethers_1.ethers.utils.hexlify(ethers_eip712_1.TypedDataUtils.typeHash(typedData.types, typedData.types.BatchMultiSigCall_[index + 1].type)),
            functionSignature: item.method
                ? ethers_1.utils.id(item.validator ? (0, helpers_1.getValidatorMethodInterface)(item.validator) : (0, helpers_1.getMethodInterface)(item))
                : "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470",
            value: item.value,
            from: ethers_1.utils.isAddress(item.from) ? item.from : this.getVariableFCValue(item.from),
            gasLimit: item.gasLimit || Number.parseInt("0x" + callDetails.gasLimit),
            flags: (0, helpers_1.manageCallFlagsV2)(item.flow || "OK_CONT_FAIL_REVERT", item.jump || 0),
            to: item.validator
                ? item.validator.validatorAddress
                : ethers_1.utils.isAddress(item.to)
                    ? item.to
                    : this.getVariableFCValue(item.to),
            ensHash: item.toEnsHash
                ? ethers_1.utils.id(item.toEnsHash)
                : "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470",
            data: item.validator ? (0, helpers_1.getValidatorData)(item, true) : (0, helpers_1.getEncodedMethodParams)(item),
            types: item.params ? (0, helpers_1.getTypesArray)(item.params) : [],
            typedHashes: item.params ? (0, helpers_1.getTypedHashes)(item.params, typedData) : [],
            ...getEncodedMulticallData(index),
        }));
        return {
            typedData,
            typeHash: ethers_1.ethers.utils.hexlify(ethers_eip712_1.TypedDataUtils.typeHash(typedData.types, typedData.primaryType)),
            sessionId: callDetails.sessionId,
            encodedMessage,
            encodedLimits,
            inputData: batchCall,
            mcall,
            addCall: async function (tx, index) {
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
                const data = await self.getMultiSigCallData(this.inputData);
                this.typedData = data.typedData;
                this.typeHash = data.typeHash;
                this.sessionId = data.sessionId;
                this.encodedMessage = data.encodedMessage;
                this.encodedLimits = data.encodedLimits;
                this.mcall = data.mcall;
                return data;
            },
            replaceCall: async function (tx, index) {
                if (index >= this.inputData.calls.length) {
                    throw new Error(`Index ${index} is out of bounds.`);
                }
                const prevCall = this.inputData.calls[index];
                this.inputData.calls[index] = tx;
                const data = await self.getMultiSigCallData(this.inputData);
                this.typedData = data.typedData;
                this.typeHash = data.typeHash;
                this.sessionId = data.sessionId;
                this.encodedMessage = data.encodedMessage;
                this.encodedLimits = data.encodedLimits;
                this.mcall = data.mcall;
                return prevCall;
            },
            removeCall: async function (index) {
                if (index >= this.inputData.calls.length) {
                    throw new Error(`Index ${index} is out of bounds.`);
                }
                const prevCall = this.inputData.calls[index];
                this.inputData.calls.splice(index, 1);
                const data = await self.getMultiSigCallData(this.inputData);
                this.typedData = data.typedData;
                this.typeHash = data.typeHash;
                this.sessionId = data.sessionId;
                this.encodedMessage = data.encodedMessage;
                this.encodedLimits = data.encodedLimits;
                this.mcall = data.mcall;
                return prevCall;
            },
            getCall: function (index) {
                return this.mcall[index];
            },
            get length() {
                return this.mcall.length;
            },
        };
    }
    decodeLimits(encodedLimits) {
        const lim = utils_1.defaultAbiCoder.decode(["bytes32", "uint64", "bool", "uint40", "uint40", "uint64"], encodedLimits);
        return {
            nonce: lim[1].toHexString(),
            payment: lim[2],
            afterTimestamp: lim[3],
            beforeTimestamp: lim[4],
            maxGasPrice: lim[5].toString(),
        };
    }
    decodeTransactions(txs) {
        return txs.map((tx) => {
            const data = tx.params && tx.params.length !== 0
                ? utils_1.defaultAbiCoder.decode(["bytes32", "bytes32", ...tx.params.map((item) => item.type)], tx.encodedMessage)
                : utils_1.defaultAbiCoder.decode(["bytes32", "bytes32"], tx.encodedMessage);
            const details = utils_1.defaultAbiCoder.decode(["bytes32", "address", "address", "bytes32", "uint256", "uint32", "bool", "bytes32", "uint8", "bytes32"], tx.encodedDetails);
            const defaultReturn = {
                typeHash: data[0],
                txHash: data[1],
                transaction: {
                    signer: details[1],
                    to: details[2],
                    toEnsHash: details[3] !== "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470"
                        ? details[3]
                        : undefined,
                    value: details[4].toString(),
                    gasLimit: details[5],
                    staticCall: details[6],
                    flow: details[7],
                    jump: details[8],
                    methodHash: details[9] !== "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470"
                        ? details[9]
                        : undefined,
                },
            };
            const extraData = tx.params && tx.params.length !== 0
                ? tx.params.reduce((acc, item, i) => ({
                    ...acc,
                    [item.name]: ethers_1.ethers.BigNumber.isBigNumber(data[2 + i]) ? data[2 + i].toString() : data[2 + i],
                }), {})
                : {};
            return {
                ...defaultReturn,
                ...extraData,
            };
        });
    }
}
exports.BatchMultiSigCall = BatchMultiSigCall;
