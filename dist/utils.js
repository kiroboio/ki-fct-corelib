"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const web3_1 = __importDefault(require("web3"));
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
exports.default = { verifyMessage, decodeSessionId };
