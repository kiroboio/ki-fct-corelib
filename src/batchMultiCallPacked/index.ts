import { defaultAbiCoder } from "ethers/lib/utils";
import Web3 from "web3";
import Contract from "web3/eth/contract";
import FactoryProxyABI from "../abi/factoryProxy_.abi.json";
import { getEncodedMethodParams, getSessionIdDetails, manageCallFlags } from "../helpers";
import {
  BatchMultiCallPackedInputInterface,
  BatchMultiCallPackedInterface,
  MultiCallInputInterface,
} from "./interfaces";

// "f000" - not-ordered, payment
const defaultFlags = {
  payment: true,
  flow: false,
  eip712: false,
};

const getMultiCallPackedData = async (
  web3: Web3,
  factoryProxy: Contract,
  batchCall: BatchMultiCallPackedInputInterface
) => {
  const typeHash = await factoryProxy.methods.BATCH_MULTI_CALL_TYPEHASH_().call();

  const { sessionId } = getSessionIdDetails(batchCall, defaultFlags, false);

  const mcallHash = defaultAbiCoder.encode(
    ["(bytes32,address,uint256,uint256,bytes)[]"],
    [batchCall.calls.map((item) => [typeHash, item.to, item.value, sessionId, getEncodedMethodParams(item, true)])]
  );

  return {
    mcall: batchCall.calls.map((item) => ({
      value: item.value,
      to: item.to,
      gasLimit: item.gasLimit || 0,
      flags: manageCallFlags(item.flags || {}),
      data: getEncodedMethodParams(item, true),
    })),
    encodedMessage: mcallHash,
    sessionId: sessionId,
    signer: batchCall.signer,
    inputData: batchCall,
  };
};

export class BatchMultiCallPacked {
  calls: Array<BatchMultiCallPackedInterface>;
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

  async addBatchCall(tx: BatchMultiCallPackedInputInterface) {
    const data = await getMultiCallPackedData(this.web3, this.FactoryProxy, tx);
    this.calls = [...this.calls, data];
    return this.calls;
  }

  async addMultipleBatchCalls(txs: BatchMultiCallPackedInputInterface[]) {
    const data = await Promise.all(txs.map((tx) => getMultiCallPackedData(this.web3, this.FactoryProxy, tx)));
    this.calls = [...this.calls, ...data];
    return this.calls;
  }

  async editBatchCall(index: number, tx: BatchMultiCallPackedInputInterface) {
    const data = await getMultiCallPackedData(this.web3, this.FactoryProxy, tx);

    this.calls[index] = data;

    return this.calls;
  }

  async removeBatchCall(index: number) {
    const restOfCalls = this.calls
      .slice(index + 1)
      .map((call) => ({ ...call.inputData, nonce: call.inputData.nonce - 1 }));

    // Remove from calls
    this.calls.splice(index, 1);

    // Adjust nonce number for the rest of the calls
    const data = await Promise.all(restOfCalls.map((tx) => getMultiCallPackedData(this.web3, this.FactoryProxy, tx)));

    this.calls.splice(-Math.abs(data.length), data.length, ...data);

    return this.calls;
  }

  async editMultiCallTx(indexOfBatch: number, indexOfMulticall: number, tx: MultiCallInputInterface) {
    const batch = this.calls[indexOfBatch].inputData;
    if (!batch) {
      throw new Error(`Batch doesn't exist on index ${indexOfBatch}`);
    }
    batch.calls[indexOfMulticall] = tx;

    const data = await getMultiCallPackedData(this.web3, this.FactoryProxy, batch);

    this.calls[indexOfBatch] = data;

    return this.calls;
  }

  async removeMultiCallTx(indexOfBatch: number, indexOfMulticall: number) {
    const batch = this.calls[indexOfBatch].inputData;

    if (!batch) {
      throw new Error(`Batch doesn't exist on index ${indexOfBatch}`);
    }

    batch.calls.splice(indexOfMulticall, 1);

    const data = await getMultiCallPackedData(this.web3, this.FactoryProxy, batch);

    this.calls[indexOfBatch] = data;

    return this.calls;
  }
}
