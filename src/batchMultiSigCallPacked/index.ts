import { defaultAbiCoder, keccak256, toUtf8Bytes } from "ethers/lib/utils";
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
import {
  BatchMultiSigCallPackedInputInterface,
  BatchMultiSigCallPackedInterface,
  MultiSigCallPackedInputInterface,
} from "./interfaces";

// "f000" - not-ordered, payment
const defaultFlags = {
  payment: true,
  flow: false,
  eip712: false,
};

const getMultiSigCallPackedData = async (
  web3: Web3,
  factoryProxy: Contract,
  batchCall: BatchMultiSigCallPackedInputInterface
) => {
  const batchMultiSigTypeHash = await factoryProxy.methods.BATCH_MULTI_SIG_CALL_TYPEHASH_().call();
  const txTypeHash = await factoryProxy.methods.PACKED_BATCH_MULTI_SIG_CALL_TRANSACTION_TYPEHASH_().call();
  const limitsTypeHash = await factoryProxy.methods.PACKED_BATCH_MULTI_SIG_CALL_LIMITS_TYPEHASH_().call();

  const group = getGroupId(batchCall.groupId);
  const tnonce = getNonce(batchCall.nonce);
  const after = getAfterTimestamp(batchCall.afterTimestamp || 0);
  const before = batchCall.beforeTimestamp
    ? getBeforeTimestamp(false, batchCall.beforeTimestamp)
    : getBeforeTimestamp(true);
  const maxGas = getMaxGas(batchCall.maxGas || 0);
  const maxGasPrice = batchCall.maxGasPrice ? getMaxGasPrice(batchCall.maxGasPrice) : "00000005D21DBA00"; // 25 Gwei
  const batchFlags = { ...defaultFlags, ...batchCall.flags };
  const eip712 = getFlags(batchFlags, false); // not-ordered, payment

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

  // Encode Limits as bytes32
  const encodeLimit = defaultAbiCoder.encode(["bytes32", "uint256"], [limitsTypeHash, getSessionId()]);
  // Encode multi calls as bytes32
  const encodedTxs = batchCall.calls.map((item) =>
    defaultAbiCoder.encode(
      ["bytes32", "address", "address", "uint256", "uint32", "uint16", "bytes"],
      [
        txTypeHash,
        item.signer,
        item.to,
        item.value,
        item.gasLimit || 0,
        item.flags ? manageCallFlags(item.flags) : "0x0",
        getEncodedMethodParamsData(item),
      ]
    )
  );

  // Combine batchMultiSigTypeHas + both encoded limits and encoded multi calls in one encoded value
  const fullEncode = defaultAbiCoder.encode(
    ["bytes32", "bytes32", ...encodedTxs.map(() => "bytes32")],
    [batchMultiSigTypeHash, keccak256(encodeLimit), ...encodedTxs.map((item) => keccak256(item))]
  );

  return {
    sessionId: getSessionId(),
    encodedLimits: encodeLimit,
    encodedData: fullEncode,
    unhashedCall: batchCall,
    mcall: batchCall.calls.map((item, i) => ({
      value: item.value,
      signer: item.signer,
      gasLimit: item.gasLimit || 0,
      flags: item.flags ? manageCallFlags(item.flags) : "0x0",
      to: item.to,
      data: getEncodedMethodParamsData(item),
      encodedTx: encodedTxs[i],
    })),
  };
};

export class BatchMultiSigCallPacked {
  calls: Array<BatchMultiSigCallPackedInterface>;
  web3: Web3;
  FactoryProxy: Contract;
  constructor(web3: Web3, contractAddress: string) {
    this.calls = [];
    this.web3 = web3;
    // @ts-ignore
    this.FactoryProxy = new web3.eth.Contract(FactoryProxyABI, contractAddress);
  }

  decodeLimits(encodedLimits: string) {
    const lim = defaultAbiCoder.decode(["bytes32", "uint256"], encodedLimits);

    return {
      sessionId: lim[1].toHexString(),
    };
  }

  decodeTxs(encodedTxs: string[]) {
    return encodedTxs.map((tx) => {
      const decTx = defaultAbiCoder.decode(
        ["bytes32", "address", "address", "uint256", "uint32", "uint16", "bytes"],
        tx
      );

      return {
        signer: decTx[1],
        to: decTx[2],
        value: decTx[3].toString(),
        gasLimit: decTx[4],
        flags: decTx[5],
        data: decTx[6],
      };
    });
  }

  async addPackedMulticall(tx: BatchMultiSigCallPackedInputInterface) {
    const data = await getMultiSigCallPackedData(this.web3, this.FactoryProxy, tx);
    this.calls = [...this.calls, data];
    return this.calls;
  }

  async addMultiplePackedMulticall(txs: BatchMultiSigCallPackedInputInterface[]) {
    const data = await Promise.all(txs.map((tx) => getMultiSigCallPackedData(this.web3, this.FactoryProxy, tx)));
    this.calls = [...this.calls, ...data];
    return this.calls;
  }

  async editBatchCall(index: number, tx: BatchMultiSigCallPackedInputInterface) {
    const data = await getMultiSigCallPackedData(this.web3, this.FactoryProxy, tx);

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
    const data = await Promise.all(
      restOfCalls.map((tx) => getMultiSigCallPackedData(this.web3, this.FactoryProxy, tx))
    );

    this.calls.splice(-Math.abs(data.length), data.length, ...data);

    return this.calls;
  }

  async editMultiCallTx(indexOfBatch: number, indexOfMulticall: number, tx: MultiSigCallPackedInputInterface) {
    const batch = this.calls[indexOfBatch].unhashedCall;
    if (!batch) {
      throw new Error(`Batch doesn't exist on index ${indexOfBatch}`);
    }
    batch.calls[indexOfMulticall] = tx;

    const data = await getMultiSigCallPackedData(this.web3, this.FactoryProxy, batch);

    this.calls[indexOfBatch] = data;

    return this.calls;
  }

  async removeMultiCallTx(indexOfBatch: number, indexOfMulticall: number) {
    const batch = this.calls[indexOfBatch].unhashedCall;

    if (!batch) {
      throw new Error(`Batch doesn't exist on index ${indexOfBatch}`);
    }

    batch.calls.splice(indexOfMulticall, 1);

    const data = await getMultiSigCallPackedData(this.web3, this.FactoryProxy, batch);

    this.calls[indexOfBatch] = data;

    return this.calls;
  }
}
