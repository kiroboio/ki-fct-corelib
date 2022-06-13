import { defaultAbiCoder, toUtf8Bytes } from "ethers/lib/utils";
import Web3 from "web3";
import Contract from "web3/eth/contract";
import FactoryProxyABI from "../abi/factoryProxy_.abi.json";
import {
  getAfterTimestamp,
  getBeforeTimestamp,
  getFlags,
  getGroupId,
  getMaxGas,
  getMaxGasPrice,
  getNonce,
  manageCallFlags,
} from "../helpers";
import { MultiCallInput, MultiCallPacked, MultiCallPackedInput } from "./interfaces";

// "f000" - not-ordered, payment
const defaultFlags = {
  payment: true,
  flow: false,
  eip712: false,
};

const getMultiCallPackedData = async (web3: Web3, factoryProxy: Contract, call: MultiCallPackedInput) => {
  const typeHash = await factoryProxy.methods.BATCH_MULTI_CALL_TYPEHASH_().call();

  const group = getGroupId(call.groupId);
  const tnonce = getNonce(call.nonce);
  const after = getAfterTimestamp(call.afterTimestamp || 0);
  const before = call.beforeTimestamp ? getBeforeTimestamp(false, call.beforeTimestamp) : getBeforeTimestamp(true);
  const maxGas = getMaxGas(call.maxGas || 0);
  const maxGasPrice = call.maxGasPrice ? getMaxGasPrice(call.maxGasPrice) : "00000005D21DBA00"; // 25 Gwei
  const eip712 = getFlags({ ...defaultFlags, ...call.flags }, false);

  const getSessionId = () => `0x${group}${tnonce}${after}${before}${maxGas}${maxGasPrice}${eip712}`;

  const getEncodedMethodParamsData = (item) => {
    return item.method
      ? web3.eth.abi.encodeFunctionCall(
          {
            name: item.method,
            type: "function",
            inputs: item.params.map((param) => ({
              type: param.type,
              name: param.name,
            })),
          },
          item.params.map((param) => param.value)
        )
      : "0x";
  };

  const mcallHash = defaultAbiCoder.encode(
    ["(bytes32,address,uint256,uint256,bytes)[]"],
    [call.mcall.map((item) => [typeHash, item.to, item.value, getSessionId(), getEncodedMethodParamsData(item)])]
  );

  return {
    mcall: call.mcall.map((item) => ({
      value: item.value,
      to: item.to,
      gasLimit: item.gasLimit || 0,
      flags: manageCallFlags(item),
      data: getEncodedMethodParamsData(item),
    })),
    encodedData: mcallHash,
    sessionId: getSessionId(),
    signer: call.signer,
    unhashedCall: call,
  };
};

export class BatchMultiCallPacked {
  calls: Array<MultiCallPacked>;
  web3: Web3;
  FactoryProxy: Contract;
  constructor(web3: Web3, contractAddress: string) {
    this.calls = [];
    this.web3 = web3;
    // @ts-ignore
    this.FactoryProxy = new web3.eth.Contract(FactoryProxyABI, contractAddress);
  }

  decodeBatch(encodedData: string) {
    const data = defaultAbiCoder.decode(["(bytes32,address,uint256,uint256,bytes)[]"], encodedData);

    return data[0].map((item) => ({
      to: item[1],
      value: item[2].toString(),
      sessionId: item[3].toHexString(),
      data: item[4],
    }));
  }

  async addPackedMulticall(tx: MultiCallPackedInput) {
    const data = await getMultiCallPackedData(this.web3, this.FactoryProxy, tx);
    this.calls = [...this.calls, data];
    return this.calls;
  }

  async addMultiplePackedMulticalls(txs: MultiCallPackedInput[]) {
    const data = await Promise.all(txs.map((tx) => getMultiCallPackedData(this.web3, this.FactoryProxy, tx)));
    this.calls = [...this.calls, ...data];
    return this.calls;
  }

  async editBatchCall(index: number, tx: MultiCallPackedInput) {
    const data = await getMultiCallPackedData(this.web3, this.FactoryProxy, tx);

    this.calls[index] = data;

    return this.calls;
  }

  async removeBatchCall(index: number) {
    const restOfCalls = this.calls
      .slice(index + 1)
      .map((call) => ({ ...call.unhashedCall, nonce: call.unhashedCall.nonce - 1 }));

    // Remove from calls
    this.calls.splice(index, 1);

    // Adjust nonce number for the rest of the calls
    const data = await Promise.all(restOfCalls.map((tx) => getMultiCallPackedData(this.web3, this.FactoryProxy, tx)));

    this.calls.splice(-Math.abs(data.length), data.length, ...data);

    return this.calls;
  }

  async editMultiCallTx(indexOfBatch: number, indexOfMulticall: number, tx: MultiCallInput) {
    const batch = this.calls[indexOfBatch].unhashedCall;
    if (!batch) {
      throw new Error(`Batch doesn't exist on index ${indexOfBatch}`);
    }
    batch.mcall[indexOfMulticall] = tx;

    const data = await getMultiCallPackedData(this.web3, this.FactoryProxy, batch);

    this.calls[indexOfBatch] = data;

    return this.calls;
  }

  async removeMultiCallTx(indexOfBatch: number, indexOfMulticall: number) {
    const batch = this.calls[indexOfBatch].unhashedCall;

    if (!batch) {
      throw new Error(`Batch doesn't exist on index ${indexOfBatch}`);
    }

    batch.mcall.splice(indexOfMulticall, 1);

    const data = await getMultiCallPackedData(this.web3, this.FactoryProxy, batch);

    this.calls[indexOfBatch] = data;

    return this.calls;
  }
}
