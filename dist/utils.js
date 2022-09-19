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
    try {
        const messageHash = ethers_1.ethers.utils.arrayify(ethers_eip712_1.TypedDataUtils.encodeDigest(typedData));
        return ethers_1.ethers.utils.recoverAddress(messageHash, signature);
    }
    catch (e) {
        return null;
    }
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
        getFCTMessageHash: () => getFCTMessageHash(FCT.typedData),
        getSigners: () => {
            return FCT.mcall.reduce((acc, { from }) => {
                if (!acc.includes(from)) {
                    acc.push(from);
                }
                return acc;
            }, []);
        },
    };
};
const parseSessionID = (sessionId, builder) => {
    // const salt = sessionId.slice(2, 8);
    const minimumApprovals = parseInt(sessionId.slice(8, 10), 16);
    // const version = sessionId.slice(10, 16);
    const maxRepeats = parseInt(sessionId.slice(16, 20), 16).toString();
    const chillTime = parseInt(sessionId.slice(20, 28), 16).toString();
    const expiresAt = parseInt(sessionId.slice(28, 38), 16).toString();
    const validFrom = parseInt(sessionId.slice(38, 48), 16).toString();
    const maxGasPrice = parseInt(sessionId.slice(48, 64), 16).toString();
    const flagsNumber = parseInt(sessionId.slice(64, 66), 16);
    let flags = {
        eip712: true,
        accumetable: false,
        purgeable: false,
        blockable: false,
    };
    if (flagsNumber === 9) {
        flags = {
            ...flags,
            accumetable: true,
        };
    }
    else if (flagsNumber === 10) {
        flags = {
            ...flags,
            purgeable: true,
        };
    }
    else if (flagsNumber === 11) {
        flags = {
            ...flags,
            accumetable: true,
            purgeable: true,
        };
    }
    else if (flagsNumber === 12) {
        flags = {
            ...flags,
            blockable: true,
        };
    }
    else if (flagsNumber === 13) {
        flags = {
            ...flags,
            accumetable: true,
            blockable: true,
        };
    }
    else if (flagsNumber === 14) {
        flags = {
            ...flags,
            purgeable: true,
            blockable: true,
        };
    }
    else if (flagsNumber === 15) {
        flags = {
            ...flags,
            accumetable: true,
            purgeable: true,
            blockable: true,
        };
    }
    const data = {
        validFrom,
        expiresAt,
        maxGasPrice,
        blockable: flags.blockable,
        purgeable: flags.purgeable,
    };
    return {
        ...data,
        builder,
        recurrency: {
            accumetable: flags.accumetable,
            chillTime,
            maxRepeats,
        },
        multisig: {
            minimumApprovals,
        },
    };
};
exports.default = { getFCTMessageHash, validateFCT, recoverAddressFromEIP712, parseSessionID };
