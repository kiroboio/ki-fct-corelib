"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ethers_1 = require("ethers");
const ethers_eip712_1 = require("ethers-eip712");
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
const recoverAddressFromEIP712 = (typedData, signature) => {
    const messageHash = ethers_1.ethers.utils.arrayify(ethers_eip712_1.TypedDataUtils.encodeDigest(typedData));
    return ethers_1.ethers.utils.recoverAddress(messageHash, signature);
};
const getFCTMessageHash = (typedData) => {
    return ethers_1.ethers.utils.hexlify(ethers_eip712_1.TypedDataUtils.hashStruct(typedData, typedData.primaryType, typedData.message));
};
const validateFCT = (FCT) => {
    const limits = FCT.typedData.message.limits;
    const fctData = FCT.typedData.message.fct;
    const currentDate = new Date().getTime() / 1000;
    const validFrom = parseInt(limits.valid_from);
    const expiresAt = parseInt(limits.expires_at);
    const gasPriceLimit = limits.gas_price_limit;
    if (validFrom > currentDate) {
        throw new Error(`FCT is not valid yet. FCT is valid from ${validFrom}`);
    }
    if (expiresAt < currentDate) {
        throw new Error(`FCT has expired. FCT expired at ${expiresAt}`);
    }
    if (gasPriceLimit === "0") {
        throw new Error(`FCT gas price limit cannot be 0`);
    }
    if (!fctData.eip712) {
        throw new Error(`FCT must be type EIP712`);
    }
    return {
        getOptions: () => {
            return {
                valid_from: limits.valid_from,
                expires_at: limits.expires_at,
                gas_price_limit: limits.gas_price_limit,
                builder: fctData.builder,
            };
        },
        getSignatures: () => {
            return FCT.signatures.map((signature) => recoverAddressFromEIP712(FCT.typedData, signature));
        },
    };
};
exports.default = { getFCTMessageHash, validateFCT, recoverAddressFromEIP712 };
