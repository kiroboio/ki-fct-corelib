import Web3 from "web3";
import { ethers } from "ethers";
import Contract from "web3/eth/contract";
import { TypedData, TypedDataUtils } from "ethers-eip712";
import { BatchCallBase, BatchFlags, MethodParamsInterface, MultiCallFlags } from "./interfaces";
import { defaultAbiCoder } from "ethers/lib/utils";

// Everything for sessionId
const getGroupId = (group: number): string => group.toString(16).padStart(6, "0");
const getNonce = (nonce: number): string => nonce.toString(16).padStart(10, "0");
const getAfterTimestamp = (epochDate: number): string => epochDate.toString(16).padStart(10, "0");
const getBeforeTimestamp = (infinity: boolean, epochDate?: number): string =>
  infinity ? "ffffffffff" : epochDate.toString(16).padStart(10, "0");
const getMaxGas = (maxGas: number): string => maxGas.toString(16).padStart(8, "0");
const getMaxGasPrice = (gasPrice: number): string => gasPrice.toString(16).padStart(16, "0");

// Get session id with all the details
export const getSessionIdDetails = (call: BatchCallBase, defaultFlags: Partial<BatchFlags>, smallFlags: boolean) => {
  const group = getGroupId(call.groupId);
  const nonce = getNonce(call.nonce);
  const after = getAfterTimestamp(call.afterTimestamp || 0);
  const before = call.beforeTimestamp ? getBeforeTimestamp(false, call.beforeTimestamp) : getBeforeTimestamp(true);
  const gasLimit = getMaxGas(call.gasLimit || 0);
  const maxGasPrice = call.maxGasPrice ? getMaxGasPrice(call.maxGasPrice) : "00000005D21DBA00"; // 25 Gwei

  const pureFlags = { ...defaultFlags, ...call.flags };
  const flags = getFlags(pureFlags, smallFlags);

  return {
    group,
    nonce,
    after,
    before,
    gasLimit,
    maxGasPrice,
    flags,
    pureFlags,
    sessionId: `0x${group}${nonce}${after}${before}${gasLimit}${maxGasPrice}${flags}`,
  };
};

// Get batch flags
export const getFlags = (flags: Partial<BatchFlags>, small: boolean) => {
  const array = ["0", "0", "0", "0"];
  if (flags.eip712 || flags.staticCall || flags.cancelable) {
    array[1] = flags.cancelable ? "8" : flags.staticCall ? "4" : "1";
  }
  array[0] = flags.payment ? "f" : "0";
  if (flags.flow) {
    array[2] = "f";
    array[3] = "f";
  }

  return small ? array.slice(0, 2).join("") : array.join("");
};

// Get flags for single call in multicalls
export const manageCallFlags = (flags: Partial<MultiCallFlags>) => {
  const array = ["0", "x", "0", "0"];
  if (flags.onFailContinue && flags.onFailStop) {
    throw new Error("Both flags onFailContinue and onFailStop can't be enabled at once");
  }
  if (flags.onSuccessRevert && flags.onSuccessStop) {
    throw new Error("Both flags onSuccessRevert and onSuccessStop can't be enabled at once");
  }
  array[2] = flags.onSuccessRevert ? "2" : flags.onSuccessRevert ? "1" : "0";
  array[3] = flags.onFailContinue ? "2" : flags.onFailStop ? "1" : "0";

  return array.join("");
};

// From method and params create tuple
export const getMethodInterface = (call: Partial<MethodParamsInterface>) => {
  return `${call.method}(${call.params.map((item) => item.type).join(",")})`;
};

// Get typehash from typedData
export const getTypeHash = (typedData: TypedData) => {
  const m2 = TypedDataUtils.typeHash(typedData.types, typedData.primaryType);
  return ethers.utils.hexZeroPad(ethers.utils.hexlify(m2), 32);
};

// Get Typed Data domain for EIP712
export const getTypedDataDomain = async (web3: Web3, factoryProxy: Contract, factoryProxyAddress: string) => {
  const chainId = await factoryProxy.methods.CHAIN_ID().call();
  return {
    name: await factoryProxy.methods.NAME().call(), // await factoryProxy.NAME(),
    version: await factoryProxy.methods.VERSION().call(), // await factoryProxy.VERSION(),
    chainId: Number("0x" + web3.utils.toBN(chainId).toString("hex")), // await web3.eth.getChainId(),
    verifyingContract: factoryProxyAddress,
    salt: await factoryProxy.methods.uid().call(),
  };
};

export const getEncodedMethodParams = (call: Partial<MethodParamsInterface>, withFunction?: boolean) => {
  if (!call.method) return "0x";

  if (withFunction) {
    const web3 = new Web3();
    return web3.eth.abi.encodeFunctionCall(
      {
        name: call.method,
        type: "function",
        inputs: call.params.map((param) => ({
          type: param.type,
          name: param.name,
        })),
      },
      call.params.map((param) => param.value)
    );
  }

  return defaultAbiCoder.encode(
    call.params.map((item) => item.type),
    call.params.map((item) => item.value)
  );
};

export const generateTxType = (item: Partial<MethodParamsInterface>) => {
  const defaults = [
    { name: "details", type: "Transaction_" },
    { name: "method_params_offset", type: "uint256" },
    { name: "method_params_length", type: "uint256" },
  ];
  return item.params
    ? [...defaults, ...item.params.map((param) => ({ name: param.name, type: param.type }))]
    : [{ name: "details", type: "Transaction_" }];
};

/*
Couldn't find a way to calculate params offset.


Params Length = (encodedParams string length - 2) / 2
And convert it into hexadecimal number.
*/

export const getParamsLength = (encodedParams: string) => {
  const paramsLength = defaultAbiCoder.encode(["bytes"], [encodedParams]).slice(66, 66 + 64);
  // return `0x${((encodedParams.length - 2) / 2).toString(16)}`;
  return `0x${paramsLength}`;
};

export const getParamsOffset = () => {
  return `0x0000000000000000000000000000000000000000000000000000000000000060`;
};
