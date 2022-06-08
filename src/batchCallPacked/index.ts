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
} from "../helpers";

// Most likely the data structure is going to be different

interface Flags {
  staticCall?: boolean;
  cancelable?: boolean;
  payment?: boolean;
}

interface Params {
  name: string;
  type: string;
  value: string;
}

interface BatchCallInputData {
  value: string;
  to: string;
  data: string;
  method: string;
  params: Params[];
  signer: string;
  groupId: number;
  nonce: number;

  afterTimestamp?: number;
  beforeTimestamp?: number;
  maxGas?: number;
  maxGasPrice?: number;
  flags?: Flags;
}

interface BatchCallPackedData {
  to: string;
  value: string;
  sessionId: string;
  signer: string;
  data: string;
  hashedData: string;
}

const defaultFlags = {
  eip712: false,
  payment: true,
  staticCall: false,
};

const getBatchCallPackedData = async (web3: Web3, factoryProxy: Contract, call: BatchCallInputData) => {
  const typeHash = await factoryProxy.methods.BATCH_CALL_PACKED_TYPEHASH_().call();

  const group = getGroupId(call.groupId);
  const tnonce = getNonce(call.nonce);
  const after = getAfterTimestamp(call.afterTimestamp || 0);
  const before = call.beforeTimestamp ? getBeforeTimestamp(false, call.beforeTimestamp) : getBeforeTimestamp(true);
  const maxGas = getMaxGas(call.maxGas || 0);
  const maxGasPrice = call.maxGasPrice ? getMaxGasPrice(call.maxGasPrice) : "00000005D21DBA00"; // 25 Gwei
  const flags = { ...defaultFlags, ...call.flags };
  const eip712 = getFlags(flags, true); // ordered, payment

  const getSessionId = () => `0x${group}${tnonce}${after}${before}${maxGas}${maxGasPrice}${eip712}`;

  const encodedMethodParamsData = call.method
    ? web3.eth.abi.encodeFunctionCall(
        {
          name: call.method,
          type: "function",
          inputs: call.params.map((param) => ({
            type: param.type,
            name: param.name,
          })),
        },
        call.params.map((param) => param.value)
      )
    : "0x";

  const hashedData = defaultAbiCoder.encode(
    ["bytes32", "address", "uint256", "uint256", "bytes"],
    [typeHash, call.to, call.value, getSessionId(), encodedMethodParamsData]
  );

  return {
    to: call.to,
    value: call.value,
    signer: call.signer,
    sessionId: getSessionId(),
    data: encodedMethodParamsData,
    hashedData,
  };
};

export class BatchCallPacked {
  calls: Array<BatchCallPackedData>;
  web3: Web3;
  FactoryProxy: Contract;
  constructor(web3: Web3, contractAddress: string) {
    this.calls = [];
    this.web3 = web3;
    // @ts-ignore
    this.FactoryProxy = new web3.eth.Contract(FactoryProxyABI, contractAddress);
  }

  verifyMessage(message: string, signature: string, address: string) {
    const messageAddress = this.web3.eth.accounts.recover(message, signature);
    return messageAddress.toLowerCase() === address.toLowerCase();
  }

  decodeData(data: string) {
    const decodedData = defaultAbiCoder.decode(["bytes32", "address", "uint256", "uint256", "bytes"], data);
    return {
      to: decodedData[1],
      value: decodedData[2].toString(),
      sessionId: decodedData[3].toHexString(),
      data: decodedData[4],
    };
  }

  async addTx(tx: BatchCallInputData) {
    const data = await getBatchCallPackedData(this.web3, this.FactoryProxy, tx);
    this.calls = [...this.calls, data];
    return this.calls;
  }

  async addMultipleTx(txs: BatchCallInputData[]) {
    const data = await Promise.all(txs.map((tx) => getBatchCallPackedData(this.web3, this.FactoryProxy, tx)));
    this.calls = [...this.calls, ...data];
    return data;
  }
}
