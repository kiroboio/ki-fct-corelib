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

// Most likely the data structure is going to be different

interface TransferFlags {
  staticCall?: boolean;
  cancelable?: boolean;
  payment?: boolean;
  flow?: boolean;
}
interface MultiCallInput {
  value: string;
  to: string;
  data: string;
  gasLimit?: number;
  onFailStop?: boolean;
  onFailContinue?: boolean;
  onSuccessStop?: boolean;
  onSuccessRevert?: boolean;
}

interface MultiCallPackedInput {
  groupId: number;
  nonce: number;
  signer: string;
  afterTimestamp?: number;
  beforeTimestamp?: number;
  maxGas?: number;
  maxGasPrice?: number;
  flags?: TransferFlags;
  mcall: MultiCallInput[];
}

interface MultiCall {
  value: string;
  to: string;
  gasLimit: number;
  flags: string;
  data: string;
}

interface MultiCallPacked {
  encodedData: string;
  sessionId: string;
  signer: string;
  mcall: MultiCall[];
}

// "f000" - not-ordered, payment
const defaultFlags = {
  payment: true,
  flow: false,
  eip712: false,
};

const getMultiCallPackedData = async (web3: Web3, factoryProxy: Contract, call: MultiCallPackedInput) => {
  // const FACTORY_DOMAIN_SEPARATOR = await factoryProxy.methods.DOMAIN_SEPARATOR().call();
  const typeHash = await factoryProxy.methods.BATCH_MULTI_CALL_TYPEHASH_().call();

  const group = getGroupId(call.groupId);
  const tnonce = getNonce(call.nonce);
  const after = getAfterTimestamp(call.afterTimestamp || 0);
  const before = call.beforeTimestamp ? getBeforeTimestamp(false, call.beforeTimestamp) : getBeforeTimestamp(true);
  const maxGas = getMaxGas(call.maxGas || 0);
  const maxGasPrice = call.maxGasPrice ? getMaxGasPrice(call.maxGasPrice) : "00000005D21DBA00"; // 25 Gwei
  const eip712 = getFlags({ ...defaultFlags, ...call.flags }, false);

  const getSessionId = () => `0x${group}${tnonce}${after}${before}${maxGas}${maxGasPrice}${eip712}`;

  const mcallHash = defaultAbiCoder.encode(
    ["(bytes32,address,uint256,uint256,bytes)[]"],
    [call.mcall.map((item) => [typeHash, item.to, item.value, getSessionId(), item.data])]
  );

  return {
    mcall: call.mcall.map((item) => ({
      value: item.value,
      to: item.to,
      gasLimit: item.gasLimit || 0,
      flags: manageCallFlags(item),
      data: item.data,
    })),
    encodedData: mcallHash,
    sessionId: getSessionId(),
    signer: call.signer,
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
}
