// import Web3 from "web3";
// import { ethers } from "ethers";
// import Contract from "web3/eth/contract";
// import { TypedDataUtils } from "ethers-eip712";
// import { defaultAbiCoder } from "ethers/lib/utils";
// import FactoryProxyABI from "../abi/factoryProxy_.abi.json";
// import { BatchCallInputInterface, BatchCallInterface } from "./interfaces";
// import { Params } from "../interfaces";
// import {
//   getEncodedMethodParams,
//   getMethodInterface,
//   getParamsLength,
//   getParamsOffset,
//   getSessionIdDetails,
//   getTypedDataDomain,
//   getTypeHash,
// } from "../helpers";
// // DefaultFlag - "f1" // payment + eip712
// const defaultFlags = {
//   eip712: true,
//   payment: true,
// };
// const getBatchCallData = async (
//   web3: Web3,
//   factoryProxy: Contract,
//   factoryProxyAddress: string,
//   call: BatchCallInputInterface
// ) => {
//   const callDetails = getSessionIdDetails(call, defaultFlags, true);
//   const methodParams = call.params
//     ? {
//         method_params_offset: getParamsOffset(),
//         method_params_length: getParamsLength(getEncodedMethodParams(call)),
//         ...call.params.reduce((acc, item) => ({ ...acc, [item.name]: item.value }), {}),
//       }
//     : {};
//   const contractType = call.params
//     ? [
//         { name: "method_params_offset", type: "uint256" },
//         { name: "method_params_length", type: "uint256" },
//         ...call.params.reduce((acc, item) => [...acc, { name: item.name, type: item.type }], []),
//       ]
//     : [];
//   const typedData = {
//     types: {
//       EIP712Domain: [
//         { name: "name", type: "string" },
//         { name: "version", type: "string" },
//         { name: "chainId", type: "uint256" },
//         { name: "verifyingContract", type: "address" },
//         { name: "salt", type: "bytes32" },
//       ],
//       BatchCall_: [{ name: "transaction", type: "Transaction_" }, ...contractType],
//       Transaction_: [
//         { name: "call_address", type: "address" },
//         { name: "call_ens", type: "string" },
//         { name: "eth_value", type: "uint256" },
//         { name: "nonce", type: "uint64" },
//         { name: "valid_from", type: "uint40" },
//         { name: "expires_at", type: "uint40" },
//         { name: "gas_limit", type: "uint32" },
//         { name: "gas_price_limit", type: "uint64" },
//         { name: "view_only", type: "bool" },
//         { name: "refund", type: "bool" },
//         { name: "method_interface", type: "string" },
//       ],
//     },
//     primaryType: "BatchCall_", // @ts-ignore
//     domain: await getTypedDataDomain(web3, factoryProxy, factoryProxyAddress),
//     message: {
//       transaction: {
//         call_address: call.to,
//         call_ens: call.toEns || "",
//         eth_value: call.value,
//         nonce: "0x" + callDetails.group + callDetails.nonce,
//         valid_from: Number.parseInt("0x" + callDetails.after),
//         expires_at: Number.parseInt("0x" + callDetails.before),
//         gas_limit: Number.parseInt("0x" + callDetails.gasLimit),
//         gas_price_limit: Number.parseInt("0x" + callDetails.maxGasPrice),
//         view_only: callDetails.pureFlags.viewOnly,
//         refund: callDetails.pureFlags.payment,
//         method_interface: call.method ? getMethodInterface(call) : "",
//       },
//       ...methodParams,
//     },
//   };
//   const encodedMessage = ethers.utils.hexlify(
//     TypedDataUtils.encodeData(typedData, typedData.primaryType, typedData.message)
//   );
//   const encodedTxMessage = ethers.utils.hexlify(
//     TypedDataUtils.encodeData(typedData, "Transaction_", typedData.message.transaction)
//   );
//   return {
//     typeHash: getTypeHash(typedData),
//     to: call.to,
//     ensHash: call.toEns
//       ? web3.utils.sha3(call.toEns)
//       : "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470",
//     value: call.value,
//     sessionId: callDetails.sessionId,
//     signer: call.signer,
//     functionSignature: call.method
//       ? web3.utils.sha3(getMethodInterface(call))
//       : "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470",
//     data: getEncodedMethodParams(call),
//     typedData,
//     encodedMessage,
//     encodedTxMessage,
//     inputData: call,
//   };
// };
// export class BatchCall {
//   calls: Array<BatchCallInterface>;
//   web3: Web3;
//   FactoryProxy: Contract;
//   factoryProxyAddress: string;
//   constructor(web3: Web3, contractAddress: string) {
//     this.calls = [];
//     this.web3 = web3;
//     // @ts-ignore
//     this.FactoryProxy = new web3.eth.Contract(FactoryProxyABI, contractAddress);
//     this.factoryProxyAddress = contractAddress;
//   }
//   decodeData(data: string, txData: string, params?: Params[]) {
//     const decodedData = params
//       ? defaultAbiCoder.decode(["bytes32", "bytes32", "bytes32", "bytes32", ...params.map((item) => item.type)], data)
//       : defaultAbiCoder.decode(["bytes32", "bytes32"], data);
//     const decodedTxData = defaultAbiCoder.decode(
//       [
//         "bytes32",
//         "address",
//         "bytes32",
//         "uint256",
//         "uint64",
//         "uint40",
//         "uint40",
//         "uint32",
//         "uint64",
//         "bool",
//         "bool",
//         "bytes32",
//       ],
//       txData
//     );
//     const defaultReturn = {
//       typeHash: decodedData[0],
//       txHash: decodedData[1],
//       transaction: {
//         to: decodedTxData[1],
//         toEnsHash:
//           decodedTxData[2] !== "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470"
//             ? decodedTxData[2]
//             : undefined,
//         value: decodedTxData[3].toString(),
//         nonce: decodedTxData[4].toHexString(),
//         afterTimestamp: decodedTxData[5],
//         beforeTimestamp: decodedTxData[6],
//         gasLimit: decodedTxData[7],
//         maxGasPrice: decodedTxData[8].toString(),
//         staticCall: decodedTxData[9],
//         payment: decodedTxData[10],
//         methodHash:
//           decodedTxData[11] !== "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470"
//             ? decodedTxData[11]
//             : undefined,
//       },
//     };
//     const extraData = params
//       ? params.reduce(
//           (acc, item, i) => ({
//             ...acc,
//             [item.name]: ethers.BigNumber.isBigNumber(decodedData[4 + i])
//               ? decodedData[4 + i].toString()
//               : decodedData[4 + i],
//           }),
//           {}
//         )
//       : {};
//     return { ...defaultReturn, decodedParams: extraData };
//   }
//   async addTx(tx: BatchCallInputInterface) {
//     const lastNonce = this.calls.length !== 0 ? this.calls[this.calls.length - 1].inputData.nonce : 0;
//     if (tx.nonce <= lastNonce) {
//       tx.nonce = lastNonce + 1;
//     }
//     const data = await getBatchCallData(this.web3, this.FactoryProxy, this.factoryProxyAddress, tx);
//     this.calls = [...this.calls, data];
//     return this.calls;
//   }
//   async addMultipleTx(txs: BatchCallInputInterface[]) {
//     const data = await Promise.all(
//       txs.map((tx) => getBatchCallData(this.web3, this.FactoryProxy, this.factoryProxyAddress, tx))
//     );
//     this.calls = [...this.calls, ...data];
//     return this.calls;
//   }
//   async editTx(index: number, tx: BatchCallInputInterface) {
//     const data = await getBatchCallData(this.web3, this.FactoryProxy, this.factoryProxyAddress, tx);
//     this.calls[index] = data;
//     return this.calls;
//   }
//   async removeTx(index: number) {
//     const restOfCalls = this.calls
//       .slice(index + 1)
//       .map((call) => ({ ...call.inputData, nonce: call.inputData.nonce - 1 }));
//     // Remove from calls
//     this.calls.splice(index, 1);
//     // Adjust nonce number for the rest of the calls
//     const data = await Promise.all(
//       restOfCalls.map((tx) => getBatchCallData(this.web3, this.FactoryProxy, this.factoryProxyAddress, tx))
//     );
//     this.calls.splice(-Math.abs(data.length), data.length, ...data);
//     return this.calls;
//   }
// }
