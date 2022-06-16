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
exports.BatchTransferPacked = void 0;
const utils_1 = require("ethers/lib/utils");
const factoryProxy__abi_json_1 = __importDefault(require("../abi/factoryProxy_.abi.json"));
const helpers_1 = require("../helpers");
// DefaultFlag - "f0" // payment + eip712
const defaultFlags = {
    eip712: false,
    payment: true,
};
const getBatchTransferPackedData = (FactoryProxy, call) => __awaiter(void 0, void 0, void 0, function* () {
    const BATCH_TRANSFER_PACKED_TYPEHASH = yield FactoryProxy.methods.BATCH_TRANSFER_PACKED_TYPEHASH_().call();
    const { sessionId } = (0, helpers_1.getSessionIdDetails)(call, defaultFlags, true);
    const encodedMessage = utils_1.defaultAbiCoder.encode(["bytes32", "address", "address", "uint256", "uint256"], [BATCH_TRANSFER_PACKED_TYPEHASH, call.token, call.to, call.value, sessionId]);
    return {
        signer: call.signer,
        token: call.token,
        to: call.to,
        value: call.value,
        sessionId,
        encodedMessage,
        unhashedCall: call,
    };
});
class BatchTransferPacked {
    constructor(web3, contractAddress) {
        this.calls = [];
        this.web3 = web3;
        // @ts-ignore
        this.FactoryProxy = new web3.eth.Contract(factoryProxy__abi_json_1.default, contractAddress);
    }
    decodeData(data) {
        const decodedData = utils_1.defaultAbiCoder.decode(["bytes32", "address", "address", "uint256", "uint256"], data);
        return {
            token: decodedData[1],
            to: decodedData[2],
            value: decodedData[3].toString(),
            sessionId: decodedData[4].toHexString(),
        };
    }
    addTx(tx) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield getBatchTransferPackedData(this.FactoryProxy, tx);
            this.calls = [...this.calls, data];
            return this.calls;
        });
    }
    addMultipleTx(tx) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield Promise.all(tx.map((item, i) => getBatchTransferPackedData(this.FactoryProxy, item)));
            this.calls = [...this.calls, ...data];
            return this.calls;
        });
    }
    editTx(index, tx) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield getBatchTransferPackedData(this.FactoryProxy, tx);
            this.calls[index] = data;
            return this.calls;
        });
    }
    removeTx(index) {
        return __awaiter(this, void 0, void 0, function* () {
            const restOfCalls = this.calls
                .slice(index + 1)
                .map((call) => (Object.assign(Object.assign({}, call.unhashedCall), { nonce: call.unhashedCall.nonce - 1 })));
            // Remove from calls
            this.calls.splice(index, 1);
            // Adjust nonce number for the rest of the calls
            const data = yield Promise.all(restOfCalls.map((tx) => getBatchTransferPackedData(this.FactoryProxy, tx)));
            this.calls.splice(-Math.abs(data.length), data.length, ...data);
            return this.calls;
        });
    }
}
exports.BatchTransferPacked = BatchTransferPacked;
