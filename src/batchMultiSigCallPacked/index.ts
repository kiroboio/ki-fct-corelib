// import { defaultAbiCoder, keccak256, toUtf8Bytes } from "ethers/lib/utils";
// import Contract from "web3/eth/contract";
// import FactoryProxyABI from "../abi/factoryProxy_.abi.json";
// import { getEncodedMethodParams, getSessionIdDetails, manageCallFlags } from "../helpers";
// import {
//   BatchMultiSigCallPackedInputInterface,
//   BatchMultiSigCallPackedInterface,
//   MultiSigCallPackedInputInterface,
// } from "./interfaces";

// // "f000" - not-ordered, payment
// const defaultFlags = {
//   payment: true,
//   flow: false,
//   eip712: false,
// };

// const getMultiSigCallPackedData = async (
//   web3: Web3,
//   factoryProxy: Contract,
//   batchCall: BatchMultiSigCallPackedInputInterface
// ) => {
//   const batchMultiSigTypeHash = await factoryProxy.methods.BATCH_MULTI_SIG_CALL_TYPEHASH_().call();
//   const txTypeHash = await factoryProxy.methods.PACKED_BATCH_MULTI_SIG_CALL_TRANSACTION_TYPEHASH_().call();
//   const limitsTypeHash = await factoryProxy.methods.PACKED_BATCH_MULTI_SIG_CALL_LIMITS_TYPEHASH_().call();

//   const { sessionId } = getSessionIdDetails(batchCall, defaultFlags, false);

//   // Encode Limits as bytes32
//   const encodeLimit = defaultAbiCoder.encode(["bytes32", "uint256"], [limitsTypeHash, sessionId]);
//   // Encode multi calls as bytes32
//   const encodedTxs = batchCall.calls.map((item) =>
//     defaultAbiCoder.encode(
//       ["bytes32", "address", "address", "uint256", "uint32", "uint16", "bytes"],
//       [
//         txTypeHash,
//         item.signer,
//         item.to,
//         item.value,
//         item.gasLimit || 0,
//         item.flags ? manageCallFlags(item.flags) : "0x0",
//         getEncodedMethodParams(item, true),
//       ]
//     )
//   );

//   // Combine batchMultiSigTypeHas + both encoded limits and encoded multi calls in one encoded value
//   const fullEncode = defaultAbiCoder.encode(
//     ["bytes32", "bytes32", ...encodedTxs.map(() => "bytes32")],
//     [batchMultiSigTypeHash, keccak256(encodeLimit), ...encodedTxs.map((item) => keccak256(item))]
//   );

//   return {
//     sessionId,
//     encodedLimits: encodeLimit,
//     encodedMessage: fullEncode,
//     inputData: batchCall,
//     mcall: batchCall.calls.map((item, i) => ({
//       value: item.value,
//       signer: item.signer,
//       gasLimit: item.gasLimit || 0,
//       flags: item.flags ? manageCallFlags(item.flags) : "0x0",
//       to: item.to,
//       data: getEncodedMethodParams(item, true),
//       encodedMessage: encodedTxs[i],
//     })),
//   };
// };

// export class BatchMultiSigCallPacked {
//   calls: Array<BatchMultiSigCallPackedInterface>;
//   web3: Web3;
//   FactoryProxy: Contract;
//   constructor(web3: Web3, contractAddress: string) {
//     this.calls = [];
//     this.web3 = web3;
//     // @ts-ignore
//     this.FactoryProxy = new web3.eth.Contract(FactoryProxyABI, contractAddress);
//   }

//   decodeLimits(encodedLimits: string) {
//     const lim = defaultAbiCoder.decode(["bytes32", "uint256"], encodedLimits);

//     return {
//       sessionId: lim[1].toHexString(),
//     };
//   }

//   decodeBatch(encodedLimits: string, encodedTxs: string[]) {
//     const lim = defaultAbiCoder.decode(["bytes32", "uint256"], encodedLimits);

//     return {
//       sessionId: lim[1].toHexString(),
//       transactions: encodedTxs.map((tx) => {
//         const decTx = defaultAbiCoder.decode(
//           ["bytes32", "address", "address", "uint256", "uint32", "uint16", "bytes"],
//           tx
//         );

//         return {
//           signer: decTx[1],
//           to: decTx[2],
//           value: decTx[3].toString(),
//           gasLimit: decTx[4],
//           flags: decTx[5],
//           data: decTx[6],
//         };
//       }),
//     };
//   }

//   async addBatchCall(tx: BatchMultiSigCallPackedInputInterface) {
//     const data = await getMultiSigCallPackedData(this.web3, this.FactoryProxy, tx);
//     this.calls = [...this.calls, data];
//     return data;
//   }

//   async addMultipleBatchCalls(txs: BatchMultiSigCallPackedInputInterface[]) {
//     const data = await Promise.all(txs.map((tx) => getMultiSigCallPackedData(this.web3, this.FactoryProxy, tx)));
//     this.calls = [...this.calls, ...data];
//     return data;
//   }

//   async editBatchCall(index: number, tx: BatchMultiSigCallPackedInputInterface) {
//     const data = await getMultiSigCallPackedData(this.web3, this.FactoryProxy, tx);

//     this.calls[index] = data;

//     return data;
//   }

//   async removeBatchCall(index: number) {
//     const restOfCalls = this.calls
//       .slice(index + 1)
//       .map((call) => ({ ...call.inputData, nonce: call.inputData.nonce - 1 }));

//     // Remove from calls
//     this.calls.splice(index, 1);

//     // Adjust nonce number for the rest of the calls
//     const data = await Promise.all(
//       restOfCalls.map((tx) => getMultiSigCallPackedData(this.web3, this.FactoryProxy, tx))
//     );

//     this.calls.splice(-Math.abs(data.length), data.length, ...data);

//     return this.calls;
//   }

//   async editMultiCallTx(indexOfBatch: number, indexOfMulticall: number, tx: MultiSigCallPackedInputInterface) {
//     const batch = this.calls[indexOfBatch].inputData;
//     if (!batch) {
//       throw new Error(`Batch doesn't exist on index ${indexOfBatch}`);
//     }
//     batch.calls[indexOfMulticall] = tx;

//     const data = await getMultiSigCallPackedData(this.web3, this.FactoryProxy, batch);

//     this.calls[indexOfBatch] = data;

//     return data;
//   }

//   async removeMultiCallTx(indexOfBatch: number, indexOfMulticall: number) {
//     const batch = this.calls[indexOfBatch].inputData;

//     if (!batch) {
//       throw new Error(`Batch doesn't exist on index ${indexOfBatch}`);
//     }

//     batch.calls.splice(indexOfMulticall, 1);

//     const data = await getMultiSigCallPackedData(this.web3, this.FactoryProxy, batch);

//     this.calls[indexOfBatch] = data;

//     return data;
//   }
// }
