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
exports.BatchMultiCallPacked = void 0;
const utils_1 = require("ethers/lib/utils");
const factoryProxy__abi_json_1 = __importDefault(require("../abi/factoryProxy_.abi.json"));
const helpers_1 = require("../helpers");
// import { MultiCallInput, MultiCallPacked, MultiCallPackedInput } from "./interfaces";
// "f000" - not-ordered, payment
const defaultFlags = {
    payment: true,
    flow: false,
    eip712: false,
};
const getMultiCallPackedData = (web3, factoryProxy, batchCall) => __awaiter(void 0, void 0, void 0, function* () {
    const typeHash = yield factoryProxy.methods.BATCH_MULTI_CALL_TYPEHASH_().call();
    const group = (0, helpers_1.getGroupId)(batchCall.groupId);
    const tnonce = (0, helpers_1.getNonce)(batchCall.nonce);
    const after = (0, helpers_1.getAfterTimestamp)(batchCall.afterTimestamp || 0);
    const before = batchCall.beforeTimestamp
        ? (0, helpers_1.getBeforeTimestamp)(false, batchCall.beforeTimestamp)
        : (0, helpers_1.getBeforeTimestamp)(true);
    const maxGas = (0, helpers_1.getMaxGas)(batchCall.maxGas || 0);
    const maxGasPrice = batchCall.maxGasPrice ? (0, helpers_1.getMaxGasPrice)(batchCall.maxGasPrice) : "00000005D21DBA00"; // 25 Gwei
    const eip712 = (0, helpers_1.getFlags)(Object.assign(Object.assign({}, defaultFlags), batchCall.flags), false);
    const getSessionId = () => `0x${group}${tnonce}${after}${before}${maxGas}${maxGasPrice}${eip712}`;
    const getEncodedMethodParamsData = (item) => {
        return item.method
            ? web3.eth.abi.encodeFunctionCall({
                name: item.method,
                type: "function",
                inputs: item.params.map((param) => ({
                    type: param.type,
                    name: param.name,
                })),
            }, item.params.map((param) => param.value))
            : "0x";
    };
    const mcallHash = utils_1.defaultAbiCoder.encode(["(bytes32,address,uint256,uint256,bytes)[]"], [batchCall.calls.map((item) => [typeHash, item.to, item.value, getSessionId(), getEncodedMethodParamsData(item)])]);
    return {
        mcall: batchCall.calls.map((item) => ({
            value: item.value,
            to: item.to,
            gasLimit: item.gasLimit || 0,
            flags: (0, helpers_1.manageCallFlags)(item.flags || {}),
            data: getEncodedMethodParamsData(item),
        })),
        encodedData: mcallHash,
        sessionId: getSessionId(),
        signer: batchCall.signer,
        unhashedCall: batchCall,
    };
});
class BatchMultiCallPacked {
    constructor(web3, contractAddress) {
        this.calls = [];
        this.web3 = web3;
        // @ts-ignore
        this.FactoryProxy = new web3.eth.Contract(factoryProxy__abi_json_1.default, contractAddress);
    }
    decodeBatch(encodedData) {
        const data = utils_1.defaultAbiCoder.decode(["(bytes32,address,uint256,uint256,bytes)[]"], encodedData);
        return data[0].map((item) => ({
            to: item[1],
            value: item[2].toString(),
            sessionId: item[3].toHexString(),
            data: item[4],
        }));
    }
    addPackedMulticall(tx) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield getMultiCallPackedData(this.web3, this.FactoryProxy, tx);
            this.calls = [...this.calls, data];
            return this.calls;
        });
    }
    addMultiplePackedMulticalls(txs) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield Promise.all(txs.map((tx) => getMultiCallPackedData(this.web3, this.FactoryProxy, tx)));
            this.calls = [...this.calls, ...data];
            return this.calls;
        });
    }
    editBatchCall(index, tx) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield getMultiCallPackedData(this.web3, this.FactoryProxy, tx);
            this.calls[index] = data;
            return this.calls;
        });
    }
    removeBatchCall(index) {
        return __awaiter(this, void 0, void 0, function* () {
            const restOfCalls = this.calls
                .slice(index + 1)
                .map((call) => (Object.assign(Object.assign({}, call.unhashedCall), { nonce: call.unhashedCall.nonce - 1 })));
            // Remove from calls
            this.calls.splice(index, 1);
            // Adjust nonce number for the rest of the calls
            const data = yield Promise.all(restOfCalls.map((tx) => getMultiCallPackedData(this.web3, this.FactoryProxy, tx)));
            this.calls.splice(-Math.abs(data.length), data.length, ...data);
            return this.calls;
        });
    }
    editMultiCallTx(indexOfBatch, indexOfMulticall, tx) {
        return __awaiter(this, void 0, void 0, function* () {
            const batch = this.calls[indexOfBatch].unhashedCall;
            if (!batch) {
                throw new Error(`Batch doesn't exist on index ${indexOfBatch}`);
            }
            batch.calls[indexOfMulticall] = tx;
            const data = yield getMultiCallPackedData(this.web3, this.FactoryProxy, batch);
            this.calls[indexOfBatch] = data;
            return this.calls;
        });
    }
    removeMultiCallTx(indexOfBatch, indexOfMulticall) {
        return __awaiter(this, void 0, void 0, function* () {
            const batch = this.calls[indexOfBatch].unhashedCall;
            if (!batch) {
                throw new Error(`Batch doesn't exist on index ${indexOfBatch}`);
            }
            batch.calls.splice(indexOfMulticall, 1);
            const data = yield getMultiCallPackedData(this.web3, this.FactoryProxy, batch);
            this.calls[indexOfBatch] = data;
            return this.calls;
        });
    }
}
exports.BatchMultiCallPacked = BatchMultiCallPacked;
