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
exports.BatchCallPacked = void 0;
const ethers_1 = require("ethers");
const utils_1 = require("ethers/lib/utils");
const factoryProxy__abi_json_1 = __importDefault(require("../abi/factoryProxy_.abi.json"));
const helpers_1 = require("../helpers");
const defaultFlags = {
    eip712: false,
    payment: true,
};
const getBatchCallPackedData = (web3, factoryProxy, call) => __awaiter(void 0, void 0, void 0, function* () {
    const typeHash = yield factoryProxy.methods.BATCH_CALL_PACKED_TYPEHASH_().call();
    const { sessionId } = (0, helpers_1.getSessionIdDetails)(call, defaultFlags, true);
    const encodedMethodParamsData = call.method
        ? web3.eth.abi.encodeFunctionCall({
            name: call.method,
            type: "function",
            inputs: call.params.map((param) => ({
                type: param.type,
                name: param.name,
            })),
        }, call.params.map((param) => param.value))
        : "0x";
    const encodedMessage = utils_1.defaultAbiCoder.encode(["bytes32", "address", "uint256", "uint256", "bytes"], [typeHash, call.to, call.value, sessionId, encodedMethodParamsData]);
    return {
        to: call.to,
        value: call.value,
        signer: call.signer,
        sessionId,
        data: encodedMethodParamsData,
        encodedMessage,
        inputData: call,
    };
});
class BatchCallPacked {
    constructor(web3, contractAddress) {
        this.calls = [];
        this.web3 = web3;
        // @ts-ignore
        this.FactoryProxy = new web3.eth.Contract(factoryProxy__abi_json_1.default, contractAddress);
    }
    verifyMessage(message, signature, address) {
        const messageAddress = this.web3.eth.accounts.recover(message, signature);
        return messageAddress.toLowerCase() === address.toLowerCase();
    }
    decodeData(data, params) {
        const decodedData = utils_1.defaultAbiCoder.decode(["bytes32", "address", "uint256", "uint256", "bytes"], data);
        const decodedParamsData = params
            ? utils_1.defaultAbiCoder.decode(params.map((item) => item.type), `0x${decodedData[4].slice(10)}`)
            : null;
        const additionalDecodedData = decodedParamsData
            ? params.reduce((acc, item, i) => (Object.assign(Object.assign({}, acc), { [item.name]: ethers_1.ethers.BigNumber.isBigNumber(decodedParamsData[i])
                    ? decodedParamsData[i].toString()
                    : decodedParamsData[i] })), {})
            : {};
        return {
            to: decodedData[1],
            value: decodedData[2].toString(),
            sessionId: decodedData[3].toHexString(),
            data: decodedData[4],
            decodedParams: additionalDecodedData,
        };
    }
    addTx(tx) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield getBatchCallPackedData(this.web3, this.FactoryProxy, tx);
            this.calls = [...this.calls, data];
            return this.calls;
        });
    }
    addMultipleTx(txs) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield Promise.all(txs.map((tx) => getBatchCallPackedData(this.web3, this.FactoryProxy, tx)));
            this.calls = [...this.calls, ...data];
            return data;
        });
    }
    editTx(index, tx) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield getBatchCallPackedData(this.web3, this.FactoryProxy, tx);
            this.calls[index] = data;
            return this.calls;
        });
    }
    removeTx(index) {
        return __awaiter(this, void 0, void 0, function* () {
            const restOfCalls = this.calls
                .slice(index + 1)
                .map((call) => (Object.assign(Object.assign({}, call.inputData), { nonce: call.inputData.nonce - 1 })));
            // Remove from calls
            this.calls.splice(index, 1);
            // Adjust nonce number for the rest of the calls
            const data = yield Promise.all(restOfCalls.map((tx) => getBatchCallPackedData(this.web3, this.FactoryProxy, tx)));
            this.calls.splice(-Math.abs(data.length), data.length, ...data);
            return this.calls;
        });
    }
}
exports.BatchCallPacked = BatchCallPacked;
