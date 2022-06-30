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
const web3_1 = __importDefault(require("web3"));
const ganache_1 = __importDefault(require("ganache"));
const helpers_1 = require("./helpers");
var Method;
(function (Method) {
    Method[Method["batchCall"] = 0] = "batchCall";
    Method[Method["batchCallPacked"] = 1] = "batchCallPacked";
    Method[Method["batchTransfer"] = 2] = "batchTransfer";
    Method[Method["batchTransferPacked"] = 3] = "batchTransferPacked";
    Method[Method["batchMultiCall"] = 4] = "batchMultiCall";
    Method[Method["batchMultiCallPacked"] = 5] = "batchMultiCallPacked";
    Method[Method["batchMultiSigCall"] = 6] = "batchMultiSigCall";
    Method[Method["batchMultiSigCallPacked"] = 7] = "batchMultiSigCallPacked";
})(Method || (Method = {}));
const web3 = new web3_1.default();
function verifyMessage(message, signature, address) {
    const messageAddress = web3.eth.accounts.recover(message, signature);
    return messageAddress.toLowerCase() === address.toLowerCase();
}
function decodeSessionId(sessionId) {
    sessionId = sessionId.replace("0x", "");
    return {
        group: parseInt(sessionId.substring(0, 6), 16),
        nonce: parseInt(sessionId.substring(6, 16), 16),
        afterTimestamp: parseInt(sessionId.substring(16, 26), 16),
        beforeTimestamp: parseInt(sessionId.substring(26, 36), 16),
        gasLimit: parseInt(sessionId.substring(36, 44), 16),
        maxGasPrice: parseInt(sessionId.substring(44, 60), 16),
        flags: sessionId.substring(60, 64),
    };
}
const transactionValidator = (transactionValidatorInterface) => __awaiter(void 0, void 0, void 0, function* () {
    if (!transactionValidatorInterface.rpcUrl) {
        throw new Error("rpcUrl is required");
    }
    if (!transactionValidatorInterface.activatorPrivateKey) {
        throw new Error("activatorPrivateKey is required");
    }
    if (!transactionValidatorInterface.factoryProxyAddress) {
        throw new Error("factoryProxyAddress is required");
    }
    const { calls, method, groupId, rpcUrl, activatorPrivateKey: activator, factoryProxyAddress, } = transactionValidatorInterface;
    // Creates a forked ganache instance from indicated chainId's rpcUrl
    const web3 = new web3_1.default(ganache_1.default.provider({
        fork: {
            url: rpcUrl,
        },
    }));
    const transaction = (0, helpers_1.getTransaction)(web3, factoryProxyAddress, `${method}_`, transactionValidatorInterface.silentRevert
        ? [calls, groupId, transactionValidatorInterface.silentRevert]
        : [calls, groupId]);
    // Create account from activator private key
    const account = web3.eth.accounts.privateKeyToAccount(activator).address;
    const options = {
        to: factoryProxyAddress,
        data: transaction.encodeABI(),
        gas: yield transaction.estimateGas({ from: account }),
    };
    // Activator signs the transaction
    const signed = yield web3.eth.accounts.signTransaction(options, activator);
    // Execute the transaction in forked ganache instance
    const tx = yield web3.eth.sendSignedTransaction(signed.rawTransaction);
    return {
        isValid: true,
        gasUsed: tx.gasUsed,
    };
});
exports.default = { verifyMessage, decodeSessionId, transactionValidator };
