"use strict";
// 0x95f9f186cbff60cecdecef460c442b82d938973becca0015d1376596daa6b574
Object.defineProperty(exports, "__esModule", { value: true });
exports.getExecutedPath = void 0;
const ethers_1 = require("ethers");
const getExecutedPath = async ({ 
//   chainId,
rpcUrl, txHash, }) => {
    const provider = new ethers_1.ethers.providers.JsonRpcProvider(rpcUrl);
    // Get the tx receipt
    const txReceipt = await provider.getTransactionReceipt(txHash);
    console.log("txReceipt", txReceipt);
};
exports.getExecutedPath = getExecutedPath;
