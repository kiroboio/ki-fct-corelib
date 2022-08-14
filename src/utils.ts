// import Web3 from "web3";
import ganache from "ganache";
import { ethers } from "ethers";
import { TypedDataUtils } from "ethers-eip712";
import { defaultAbiCoder } from "ethers/lib/utils";

enum Method {
  batchCall,
  batchCallPacked,
  batchTransfer,
  batchTransferPacked,
  batchMultiCall,
  batchMultiCallPacked,
  batchMultiSigCall,
  batchMultiSigCallPacked,
}

type method = keyof typeof Method;

interface transactionValidatorInterface {
  calls: any[];
  method: method;
  groupId: number;
  silentRevert?: boolean;
  rpcUrl: string;
  activatorPrivateKey: string;
  factoryProxyAddress: string;
}

// const web3 = new Web3();

// function verifyMessage(message: string, signature: string, address: string) {
//   const messageAddress = web3.eth.accounts.recover(message, signature);
//   return messageAddress.toLowerCase() === address.toLowerCase();
// }

function decodeSessionId(sessionId: string) {
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

const getEncodedData = (types: string[], values: string[]) => {
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
      return { ...acc, [`param${i}`]: value };
    }, {}),
  };

  const abiEncodedMessage = defaultAbiCoder.encode(types, values);

  return {
    eipMessage: ethers.utils.hexlify(TypedDataUtils.encodeData(typedData, typedData.primaryType, typedData.message)),
    abiEncodedMessage,
  };
};

export default { decodeSessionId, getEncodedData };
