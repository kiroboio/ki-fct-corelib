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
exports.BatchMultiCall = void 0;
const ethers_1 = require("ethers");
const ethers_eip712_1 = require("ethers-eip712");
const utils_1 = require("ethers/lib/utils");
const factoryProxy__abi_json_1 = __importDefault(require("../abi/factoryProxy_.abi.json"));
const helpers_1 = require("../helpers");
// DefaultFlag - "f100" // payment + eip712
const defaultFlags = {
    eip712: true,
    payment: true,
};
const getBatchMultiCallData = (web3, FactoryProxy, factoryProxyAddress, batchCall) => __awaiter(void 0, void 0, void 0, function* () {
    const callDetails = (0, helpers_1.getSessionIdDetails)(batchCall, defaultFlags, false);
    // Creates messages from multiCalls array for EIP712 sign
    // If multicall has encoded contract data, add method_params_offset, method_params_length and method data variables
    // Else multicall is ETH Transfer - add only details
    const typedDataMessage = batchCall.calls.reduce((acc, item, index) => {
        var _a, _b, _c, _d, _e;
        const additionalTxData = item.params
            ? Object.assign({ method_params_offset: (0, helpers_1.getParamsOffset)(), method_params_length: (0, helpers_1.getParamsLength)((0, helpers_1.getEncodedMethodParams)(item, false)) }, item.params.reduce((acc, param) => (Object.assign(Object.assign({}, acc), { [param.name]: param.value })), {})) : {};
        return Object.assign(Object.assign({}, acc), { [`transaction_${index + 1}`]: Object.assign({ details: {
                    call_address: item.to,
                    call_ens: item.toEnsHash || "",
                    eth_value: item.value,
                    gas_limit: item.gasLimit || Number.parseInt("0x" + callDetails.gasLimit),
                    view_only: ((_a = item.flags) === null || _a === void 0 ? void 0 : _a.viewOnly) || false,
                    continue_on_fail: ((_b = item.flags) === null || _b === void 0 ? void 0 : _b.onFailContinue) || false,
                    stop_on_fail: ((_c = item.flags) === null || _c === void 0 ? void 0 : _c.onFailStop) || false,
                    stop_on_success: ((_d = item.flags) === null || _d === void 0 ? void 0 : _d.onSuccessStop) || false,
                    revert_on_success: ((_e = item.flags) === null || _e === void 0 ? void 0 : _e.onSuccessRevert) || false,
                    method_interface: item.method ? (0, helpers_1.getMethodInterface)(item) : "",
                } }, additionalTxData) });
    }, {});
    const typedData = {
        types: Object.assign({ EIP712Domain: [
                { name: "name", type: "string" },
                { name: "version", type: "string" },
                { name: "chainId", type: "uint256" },
                { name: "verifyingContract", type: "address" },
                { name: "salt", type: "bytes32" },
            ], BatchMultiCall_: [
                { name: "limits", type: "Limits_" },
                ...batchCall.calls.map((_, index) => ({ name: `transaction_${index + 1}`, type: `Transaction_${index + 1}` })),
            ], Limits_: [
                { name: "nonce", type: "uint64" },
                { name: "refund", type: "bool" },
                { name: "valid_from", type: "uint40" },
                { name: "expires_at", type: "uint40" },
                { name: "gas_price_limit", type: "uint64" },
            ], Transaction_: [
                { name: "call_address", type: "address" },
                { name: "call_ens", type: "string" },
                { name: "eth_value", type: "uint256" },
                { name: "gas_limit", type: "uint32" },
                { name: "view_only", type: "bool" },
                { name: "continue_on_fail", type: "bool" },
                { name: "stop_on_fail", type: "bool" },
                { name: "stop_on_success", type: "bool" },
                { name: "revert_on_success", type: "bool" },
                { name: "method_interface", type: "string" },
            ] }, batchCall.calls.reduce((acc, item, index) => (Object.assign(Object.assign({}, acc), { [`Transaction_${index + 1}`]: (0, helpers_1.generateTxType)(item) })), {})),
        primaryType: "BatchMultiCall_",
        domain: yield (0, helpers_1.getTypedDataDomain)(web3, FactoryProxy, factoryProxyAddress),
        message: Object.assign({ limits: {
                nonce: "0x" + callDetails.group + callDetails.nonce,
                refund: callDetails.pureFlags.payment,
                valid_from: Number.parseInt("0x" + callDetails.after),
                expires_at: Number.parseInt("0x" + callDetails.before),
                gas_price_limit: Number.parseInt("0x" + callDetails.maxGasPrice),
            } }, typedDataMessage),
    };
    const encodedMessage = ethers_1.ethers.utils.hexlify(ethers_eip712_1.TypedDataUtils.encodeData(typedData, typedData.primaryType, typedData.message));
    const encodedLimits = ethers_1.ethers.utils.hexlify(ethers_eip712_1.TypedDataUtils.encodeData(typedData, "Limits_", typedData.message.limits));
    const getHashedMulticallData = (index) => {
        const encodedMessage = ethers_1.ethers.utils.hexlify(ethers_eip712_1.TypedDataUtils.encodeData(typedData, `Transaction_${index + 1}`, typedData.message[`transaction_${index + 1}`]));
        const encodedDetails = ethers_1.ethers.utils.hexlify(ethers_eip712_1.TypedDataUtils.encodeData(typedData, `Transaction_`, typedData.message[`transaction_${index + 1}`].details));
        return {
            encodedMessage,
            encodedDetails,
        };
    };
    return {
        typeHash: ethers_1.ethers.utils.hexlify(ethers_eip712_1.TypedDataUtils.typeHash(typedData.types, typedData.primaryType)),
        sessionId: callDetails.sessionId,
        signer: batchCall.signer,
        typedData,
        encodedMessage,
        encodedLimits,
        inputData: batchCall,
        mcall: batchCall.calls.map((item, index) => (Object.assign({ value: item.value, to: item.to, data: (0, helpers_1.getEncodedMethodParams)(item, false), ensHash: item.toEnsHash
                ? web3.utils.sha3(item.toEnsHash)
                : "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470", typeHash: ethers_1.ethers.utils.hexlify(ethers_eip712_1.TypedDataUtils.typeHash(typedData.types, typedData.types.BatchMultiCall_[index + 1].type)), flags: item.flags ? (0, helpers_1.manageCallFlags)(item.flags) : "0", functionSignature: item.method
                ? web3.utils.sha3((0, helpers_1.getMethodInterface)(item))
                : "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470", gasLimit: Number.parseInt("0x" + callDetails.gasLimit) }, getHashedMulticallData(index)))),
    };
});
class BatchMultiCall {
    constructor(web3, contractAddress) {
        this.calls = [];
        this.web3 = web3;
        // @ts-ignore
        this.FactoryProxy = new web3.eth.Contract(factoryProxy__abi_json_1.default, contractAddress);
        this.factoryProxyAddress = contractAddress;
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
                ? utils_1.defaultAbiCoder.decode(["bytes32", "bytes32", "uint256", "uint256", ...tx.params.map((item) => item.type)], tx.encodedMessage)
                : utils_1.defaultAbiCoder.decode(["bytes32", "bytes32"], tx.encodedMessage);
            const details = utils_1.defaultAbiCoder.decode(["bytes32", "address", "bytes32", "uint256", "uint32", "bool", "bool", "bool", "bool", "bool", "bytes32"], tx.encodedDetails);
            const defaultReturn = {
                typeHash: data[0],
                txHash: data[1],
                transaction: {
                    to: details[1],
                    toEnsHash: details[2] !== "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470"
                        ? details[2]
                        : undefined,
                    value: details[3].toString(),
                    gasLimit: details[4],
                    staticCall: details[5],
                    continueOnFail: details[6],
                    stopOnFail: details[7],
                    stopOnSuccess: details[8],
                    revertOnSuccess: details[9],
                    functionSignature: details[10] !== "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470"
                        ? details[10]
                        : undefined,
                },
            };
            const extraData = tx.params && tx.params.length !== 0
                ? tx.params.reduce((acc, item, i) => (Object.assign(Object.assign({}, acc), { [item.name]: ethers_1.ethers.BigNumber.isBigNumber(data[4 + i]) ? data[4 + i].toString() : data[4 + i] })), {})
                : {};
            return Object.assign(Object.assign({}, defaultReturn), { decodedParams: extraData });
        });
    }
    addBatchCall(tx) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield getBatchMultiCallData(this.web3, this.FactoryProxy, this.factoryProxyAddress, tx);
            this.calls = [...this.calls, data];
            return this.calls;
        });
    }
    addMultipleBatchCalls(txs) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield Promise.all(txs.map((tx) => getBatchMultiCallData(this.web3, this.FactoryProxy, this.factoryProxyAddress, tx)));
            this.calls = [...this.calls, ...data];
            return this.calls;
        });
    }
    editBatchCall(index, tx) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield getBatchMultiCallData(this.web3, this.FactoryProxy, this.factoryProxyAddress, tx);
            this.calls[index] = data;
            return this.calls;
        });
    }
    removeBatchCall(index) {
        return __awaiter(this, void 0, void 0, function* () {
            const restOfCalls = this.calls
                .slice(index + 1)
                .map((call) => (Object.assign(Object.assign({}, call.inputData), { nonce: call.inputData.nonce - 1 })));
            // Remove from calls
            this.calls.splice(index, 1);
            // Adjust nonce number for the rest of the calls
            const data = yield Promise.all(restOfCalls.map((tx) => getBatchMultiCallData(this.web3, this.FactoryProxy, this.factoryProxyAddress, tx)));
            this.calls.splice(-Math.abs(data.length), data.length, ...data);
            return this.calls;
        });
    }
    editMultiCallTx(indexOfBatch, indexOfMulticall, tx) {
        return __awaiter(this, void 0, void 0, function* () {
            const batch = this.calls[indexOfBatch].inputData;
            if (!batch) {
                throw new Error(`Batch doesn't exist on index ${indexOfBatch}`);
            }
            batch.calls[indexOfMulticall] = tx;
            const data = yield getBatchMultiCallData(this.web3, this.FactoryProxy, this.factoryProxyAddress, batch);
            this.calls[indexOfBatch] = data;
            return this.calls;
        });
    }
    removeMultiCallTx(indexOfBatch, indexOfMulticall) {
        return __awaiter(this, void 0, void 0, function* () {
            const batch = this.calls[indexOfBatch].inputData;
            if (!batch) {
                throw new Error(`Batch doesn't exist on index ${indexOfBatch}`);
            }
            batch.calls.splice(indexOfMulticall, 1);
            const data = yield getBatchMultiCallData(this.web3, this.FactoryProxy, this.factoryProxyAddress, batch);
            this.calls[indexOfBatch] = data;
            return this.calls;
        });
    }
}
exports.BatchMultiCall = BatchMultiCall;
