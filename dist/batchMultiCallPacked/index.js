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
// "f000" - not-ordered, payment
const defaultFlags = {
    payment: true,
    flow: false,
    eip712: false,
};
const getMultiCallPackedData = (web3, factoryProxy, call) => __awaiter(void 0, void 0, void 0, function* () {
    const FACTORY_DOMAIN_SEPARATOR = yield factoryProxy.methods.DOMAIN_SEPARATOR().call();
    const typeHash = yield factoryProxy.methods.BATCH_MULTI_CALL_TYPEHASH_().call();
    const group = (0, helpers_1.getGroupId)(call.groupId);
    const tnonce = (0, helpers_1.getNonce)(call.nonce);
    const after = (0, helpers_1.getAfterTimestamp)(call.afterTimestamp || 0);
    const before = call.beforeTimestamp ? (0, helpers_1.getBeforeTimestamp)(false, call.beforeTimestamp) : (0, helpers_1.getBeforeTimestamp)(true);
    const maxGas = (0, helpers_1.getMaxGas)(call.maxGas || 0);
    const maxGasPrice = call.maxGasPrice ? (0, helpers_1.getMaxGasPrice)(call.maxGasPrice) : "00000005D21DBA00"; // 25 Gwei
    const eip712 = (0, helpers_1.getFlags)(Object.assign(Object.assign({}, defaultFlags), call.flags), false);
    const getSessionId = () => `0x${group}${tnonce}${after}${before}${maxGas}${maxGasPrice}${eip712}`;
    const mcallHash = utils_1.defaultAbiCoder.encode(["(bytes32,address,uint256,uint256,bytes)[]"], [call.mcall.map((item) => [typeHash, item.to, item.value, getSessionId(), item.data])]);
    const signature = yield web3.eth.sign(FACTORY_DOMAIN_SEPARATOR + web3.utils.sha3(mcallHash).slice(2), call.signer);
    const r = signature.slice(0, 66);
    const s = "0x" + signature.slice(66, 130);
    const v = "0x" + signature.slice(130);
    return {
        mcall: call.mcall.map((item) => ({
            value: item.value,
            to: item.to,
            gasLimit: item.gasLimit || 0,
            flags: (0, helpers_1.manageCallFlags)(item),
            data: item.data,
        })),
        r,
        s,
        v,
        sessionId: getSessionId(),
        signer: call.signer,
    };
});
class BatchMultiCallPacked {
    constructor(web3, contractAddress) {
        this.calls = [];
        this.web3 = web3;
        // @ts-ignore
        this.FactoryProxy = new web3.eth.Contract(factoryProxy__abi_json_1.default, contractAddress);
    }
    addPackedMulticall(tx) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield getMultiCallPackedData(this.web3, this.FactoryProxy, tx);
            this.calls = [...this.calls, data];
            return this.calls;
        });
    }
    removePackedMulticall(index) {
        if (this.calls.length === 0) {
            throw new Error("No calls have been added");
        }
        this.calls.splice(index, 1);
        return this.calls;
    }
    addMultiplePackedMulticalls(txs) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield Promise.all(txs.map((tx) => getMultiCallPackedData(this.web3, this.FactoryProxy, tx)));
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
            return yield this.FactoryProxy.methods.batchMultiCallPacked_(calls, groupId).send({ from: activator });
        });
    }
}
exports.BatchMultiCallPacked = BatchMultiCallPacked;
