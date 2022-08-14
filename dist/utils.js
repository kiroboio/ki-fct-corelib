"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ethers_1 = require("ethers");
const ethers_eip712_1 = require("ethers-eip712");
const utils_1 = require("ethers/lib/utils");
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
// const web3 = new Web3();
// function verifyMessage(message: string, signature: string, address: string) {
//   const messageAddress = web3.eth.accounts.recover(message, signature);
//   return messageAddress.toLowerCase() === address.toLowerCase();
// }
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
// Has to be implemented with ETHERS not WEB3
// const transactionValidator = async (transactionValidatorInterface: transactionValidatorInterface) => {
//   if (!transactionValidatorInterface.rpcUrl) {
//     throw new Error("rpcUrl is required");
//   }
//   if (!transactionValidatorInterface.activatorPrivateKey) {
//     throw new Error("activatorPrivateKey is required");
//   }
//   if (!transactionValidatorInterface.factoryProxyAddress) {
//     throw new Error("factoryProxyAddress is required");
//   }
//   const {
//     calls,
//     method,
//     groupId,
//     rpcUrl,
//     activatorPrivateKey: activator,
//     factoryProxyAddress,
//   } = transactionValidatorInterface;
//   // Creates a forked ganache instance from indicated chainId's rpcUrl
//   const web3 = new Web3(
//     ganache.provider({
//       fork: {
//         url: rpcUrl,
//       },
//     }) as any
//   );
//   const transaction = getTransaction(
//     web3,
//     factoryProxyAddress,
//     `${method}_`,
//     transactionValidatorInterface.silentRevert
//       ? [calls, groupId, transactionValidatorInterface.silentRevert]
//       : [calls, groupId]
//   );
//   // Create account from activator private key
//   const account = web3.eth.accounts.privateKeyToAccount(activator as string).address;
//   const options = {
//     to: factoryProxyAddress,
//     data: transaction.encodeABI(),
//     gas: await transaction.estimateGas({ from: account }),
//   };
//   // Activator signs the transaction
//   const signed = await web3.eth.accounts.signTransaction(options, activator as string);
//   // Execute the transaction in forked ganache instance
//   const tx = await web3.eth.sendSignedTransaction(signed.rawTransaction as string);
//   return {
//     isValid: true,
//     gasUsed: tx.gasUsed,
//   };
// };
const getEncodedData = (types, values) => {
    const typedData = {
        types: {
            EIP712Domain: [
                { name: "name", type: "string" },
                { name: "version", type: "string" },
                { name: "chainId", type: "uint256" },
                { name: "verifyingContract", type: "address" },
            ],
            params: types.map((type, i) => ({ name: `param${i}`, type })),
        },
        primaryType: "params",
        domain: {
            name: "Ether Mail",
            version: "1",
            chainId: 1,
            verifyingContract: "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC",
        },
        message: values.reduce((acc, value, i) => {
            return Object.assign(Object.assign({}, acc), { [`param${i}`]: value });
        }, {}),
    };
    const abiEncodedMessage = utils_1.defaultAbiCoder.encode(types, values);
    return {
        eipMessage: ethers_1.ethers.utils.hexlify(ethers_eip712_1.TypedDataUtils.encodeData(typedData, typedData.primaryType, typedData.message)),
        abiEncodedMessage,
    };
};
exports.default = { decodeSessionId, getEncodedData };
