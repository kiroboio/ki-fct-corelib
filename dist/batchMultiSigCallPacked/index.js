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
exports.BatchMultiSigCallPacked = void 0;
const utils_1 = require("ethers/lib/utils");
const factoryProxy__abi_json_1 = __importDefault(require("../abi/factoryProxy_.abi.json"));
const helpers_1 = require("../helpers");
// "f000" - not-ordered, payment
const defaultFlags = {
    payment: true,
    flow: false,
    eip712: false,
};
const getMultiSigCallPackedData = (web3, factoryProxy, batchCall) => __awaiter(void 0, void 0, void 0, function* () {
    const batchMultiSigTypeHash = yield factoryProxy.methods.BATCH_MULTI_SIG_CALL_TYPEHASH_().call();
    const txTypeHash = yield factoryProxy.methods.PACKED_BATCH_MULTI_SIG_CALL_TRANSACTION_TYPEHASH_().call();
    const limitsTypeHash = yield factoryProxy.methods.PACKED_BATCH_MULTI_SIG_CALL_LIMITS_TYPEHASH_().call();
    const { sessionId } = (0, helpers_1.getSessionIdDetails)(batchCall, defaultFlags, false);
    // Encode Limits as bytes32
    const encodeLimit = utils_1.defaultAbiCoder.encode(["bytes32", "uint256"], [limitsTypeHash, sessionId]);
    // Encode multi calls as bytes32
    const encodedTxs = batchCall.calls.map((item) => utils_1.defaultAbiCoder.encode(["bytes32", "address", "address", "uint256", "uint32", "uint16", "bytes"], [
        txTypeHash,
        item.signer,
        item.to,
        item.value,
        item.gasLimit || 0,
        item.flags ? (0, helpers_1.manageCallFlags)(item.flags) : "0x0",
        (0, helpers_1.getEncodedMethodParams)(item, true),
    ]));
    // Combine batchMultiSigTypeHas + both encoded limits and encoded multi calls in one encoded value
    const fullEncode = utils_1.defaultAbiCoder.encode(["bytes32", "bytes32", ...encodedTxs.map(() => "bytes32")], [batchMultiSigTypeHash, (0, utils_1.keccak256)(encodeLimit), ...encodedTxs.map((item) => (0, utils_1.keccak256)(item))]);
    return {
        sessionId,
        encodedLimits: encodeLimit,
        encodedMessage: fullEncode,
        inputData: batchCall,
        mcall: batchCall.calls.map((item, i) => ({
            value: item.value,
            signer: item.signer,
            gasLimit: item.gasLimit || 0,
            flags: item.flags ? (0, helpers_1.manageCallFlags)(item.flags) : "0x0",
            to: item.to,
            data: (0, helpers_1.getEncodedMethodParams)(item, true),
            encodedMessage: encodedTxs[i],
        })),
    };
});
class BatchMultiSigCallPacked {
    constructor(web3, contractAddress) {
        this.calls = [];
        this.web3 = web3;
        // @ts-ignore
        this.FactoryProxy = new web3.eth.Contract(factoryProxy__abi_json_1.default, contractAddress);
    }
    decodeLimits(encodedLimits) {
        const lim = utils_1.defaultAbiCoder.decode(["bytes32", "uint256"], encodedLimits);
        return {
            sessionId: lim[1].toHexString(),
        };
    }
    decodeBatch(encodedLimits, encodedTxs) {
        const lim = utils_1.defaultAbiCoder.decode(["bytes32", "uint256"], encodedLimits);
        return {
            sessionId: lim[1].toHexString(),
            transactions: encodedTxs.map((tx) => {
                const decTx = utils_1.defaultAbiCoder.decode(["bytes32", "address", "address", "uint256", "uint32", "uint16", "bytes"], tx);
                return {
                    signer: decTx[1],
                    to: decTx[2],
                    value: decTx[3].toString(),
                    gasLimit: decTx[4],
                    flags: decTx[5],
                    data: decTx[6],
                };
            }),
        };
    }
    addPackedMulticall(tx) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield getMultiSigCallPackedData(this.web3, this.FactoryProxy, tx);
            this.calls = [...this.calls, data];
            return this.calls;
        });
    }
    addMultiplePackedMulticall(txs) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield Promise.all(txs.map((tx) => getMultiSigCallPackedData(this.web3, this.FactoryProxy, tx)));
            this.calls = [...this.calls, ...data];
            return this.calls;
        });
    }
    editBatchCall(index, tx) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield getMultiSigCallPackedData(this.web3, this.FactoryProxy, tx);
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
            const data = yield Promise.all(restOfCalls.map((tx) => getMultiSigCallPackedData(this.web3, this.FactoryProxy, tx)));
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
            const data = yield getMultiSigCallPackedData(this.web3, this.FactoryProxy, batch);
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
            const data = yield getMultiSigCallPackedData(this.web3, this.FactoryProxy, batch);
            this.calls[indexOfBatch] = data;
            return this.calls;
        });
    }
}
exports.BatchMultiSigCallPacked = BatchMultiSigCallPacked;
