import { defaultAbiCoder, toUtf8Bytes } from "ethers/lib/utils";
import Web3 from "web3";
import Contract from "web3/eth/contract";
import FactoryProxyABI from "../abi/factoryProxy_.abi.json";
import { getAfterTimestamp, getBeforeTimestamp, getGroupId, getMaxGas, getMaxGasPrice, getNonce } from "../helpers";

// Most likely the data structure is going to be different

interface BatchCallInputData {
  value: string;
  to: string;
  data: string;
  signer: string;
  groupId: number;
  nonce: number;
  viewOnly?: boolean;
  afterTimestamp?: number;
  beforeTimestamp?: number;
  maxGas?: number;
  maxGasPrice?: number;
}

interface BatchCallPackedData {
  r: string;
  s: string;
  to: string;
  value: string;
  sessionId: string;
  signer: string;
  data: string;
}

const getBatchCallPackedData = async (web3: Web3, factoryProxy: Contract, call: BatchCallInputData) => {
  const typeHash = await factoryProxy.methods.BATCH_CALL_PACKED_TYPEHASH_().call();
  const FACTORY_DOMAIN_SEPARATOR = await factoryProxy.methods.DOMAIN_SEPARATOR().call();

  const group = getGroupId(call.groupId);
  const tnonce = getNonce(call.nonce);
  const after = getAfterTimestamp(call.afterTimestamp || 0);
  const before = call.beforeTimestamp ? getBeforeTimestamp(false, call.beforeTimestamp) : getBeforeTimestamp(true);
  const maxGas = getMaxGas(call.maxGas || 0);
  const maxGasPrice = call.maxGasPrice ? getMaxGasPrice(call.maxGasPrice) : "00000005D21DBA00"; // 25 Gwei
  const eip712 = call.viewOnly ? "f4" : "f2"; // ordered, payment

  const getSessionId = () => `0x${group}${tnonce}${after}${before}${maxGas}${maxGasPrice}${eip712}`;

  const hashedData = defaultAbiCoder.encode(
    ["bytes32", "address", "uint256", "uint256", "bytes"],
    [typeHash, call.to, call.value, getSessionId(), call.data]
  );

  const signature = await web3.eth.sign(FACTORY_DOMAIN_SEPARATOR + web3.utils.sha3(hashedData).slice(2), call.signer);
  const r = signature.slice(0, 66);
  const s = "0x" + signature.slice(66, 130);
  const v = "0x" + signature.slice(130);

  return {
    r,
    s,
    to: call.to,
    value: call.value,
    signer: call.signer,
    sessionId: getSessionId() + v.slice(2).padStart(2, "0"),
    data: call.data,
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

  async execute(activator: string, groupId: number, silentRevert: boolean) {
    const calls = this.calls;

    if (calls.length === 0) {
      throw new Error("No call have been added.");
    }

    return await this.FactoryProxy.methods.batchCallPacked_(calls, groupId, silentRevert).send({ from: activator });
  }
}
