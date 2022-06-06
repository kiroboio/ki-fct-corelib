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
const getMultiSigCallPackedData = (web3, factoryProxy, call) => __awaiter(void 0, void 0, void 0, function* () {
    const batchMultiSigTypeHash = yield factoryProxy.methods.BATCH_MULTI_SIG_CALL_TYPEHASH_().call();
    const txTypeHash = yield factoryProxy.methods.PACKED_BATCH_MULTI_SIG_CALL_TRANSACTION_TYPEHASH_().call();
    const limitsTypeHash = yield factoryProxy.methods.PACKED_BATCH_MULTI_SIG_CALL_LIMITS_TYPEHASH_().call();
    const domainSeparator = yield factoryProxy.methods.DOMAIN_SEPARATOR().call();
    const group = (0, helpers_1.getGroupId)(call.groupId);
    const tnonce = (0, helpers_1.getNonce)(call.nonce);
    const after = (0, helpers_1.getAfterTimestamp)(call.afterTimestamp || 0);
    const before = call.beforeTimestamp ? (0, helpers_1.getBeforeTimestamp)(false, call.beforeTimestamp) : (0, helpers_1.getBeforeTimestamp)(true);
    const maxGas = (0, helpers_1.getMaxGas)(call.maxGas || 0);
    const maxGasPrice = call.maxGasPrice ? (0, helpers_1.getMaxGasPrice)(call.maxGasPrice) : "00000005D21DBA00"; // 25 Gwei
    const batchFlags = Object.assign(Object.assign({}, defaultFlags), call.flags);
    const eip712 = (0, helpers_1.getFlags)(batchFlags, false); // not-ordered, payment
    const getSessionId = () => `0x${group}${tnonce}${after}${before}${maxGas}${maxGasPrice}${eip712}`;
    // Encode Limits as bytes32
    const encodeLimit = (0, utils_1.keccak256)(utils_1.defaultAbiCoder.encode(["bytes32", "uint256"], [limitsTypeHash, getSessionId()]));
    // Encode multi calls as bytes32
    const encodedTxs = call.multiCalls.map((item) => (0, utils_1.keccak256)(utils_1.defaultAbiCoder.encode(["bytes32", "address", "address", "uint256", "uint32", "uint16", "bytes"], [
        txTypeHash,
        item.signer,
        item.to,
        item.value,
        item.gasLimit || 0,
        item.flags ? (0, helpers_1.manageCallFlags)(item.flags) : "0x0",
        item.data,
    ])));
    // Combine batchMultiSigTypeHas + both encoded limits and encoded multi calls in one encoded value
    const fullEncode = utils_1.defaultAbiCoder.encode(["bytes32", "bytes32", ...encodedTxs.map(() => "bytes32")], [batchMultiSigTypeHash, encodeLimit, ...encodedTxs.map((item) => item)]);
    const signatures = yield Promise.all(call.signers.map((signer) => web3.eth.sign(domainSeparator + web3.utils.sha3(fullEncode).slice(2), signer)));
    return {
        signatures: signatures.map((signature) => ({
            r: signature.slice(0, 66),
            s: "0x" + signature.slice(66, 130),
            v: "0x" + signature.slice(130),
        })),
        sessionId: getSessionId(),
        mcall: call.multiCalls.map((item) => ({
            value: item.value,
            signer: item.signer,
            gasLimit: item.gasLimit || 0,
            flags: item.flags ? (0, helpers_1.manageCallFlags)(item.flags) : "0x0",
            to: item.to,
            data: item.data,
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
    execute(activator, groupId) {
        return __awaiter(this, void 0, void 0, function* () {
            const calls = this.calls;
            if (calls.length === 0) {
                throw new Error("No calls have been added");
            }
            return yield this.FactoryProxy.methods.batchMultiSigCallPacked_(calls, groupId).send({ from: activator });
        });
    }
}
exports.BatchMultiSigCallPacked = BatchMultiSigCallPacked;
