import { ethers } from "ethers";
import { defaultAbiCoder } from "ethers/lib/utils";
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

interface TransferFlags {
  staticCall?: boolean;
  cancelable?: boolean;
  payment?: boolean;
}
// Most likely the data structure is going to be different
interface TransferCall {
  token: string;
  to: string;
  value: number;
  signer: string;
  groupId: number;
  nonce: number;
  afterTimestamp?: number;
  beforeTimestamp?: number;
  maxGas?: number;
  maxGasPrice?: number;
  flags?: TransferFlags;
}

interface Transfer {
  signer: string;
  token: string;
  to: string;
  value: number;
  sessionId: string;
  hashedData: string;
}

// DefaultFlag - "f0" // payment + eip712
const defaultFlags = {
  eip712: false,
  payment: true,
};

const getBatchTransferPackedData = async (FactoryProxy: Contract, call: TransferCall) => {
  const BATCH_TRANSFER_PACKED_TYPEHASH = await FactoryProxy.methods.BATCH_TRANSFER_PACKED_TYPEHASH_().call();

  const group = getGroupId(call.groupId); // Has to be a way to determine group dynamically
  const tnonce = getNonce(call.nonce);
  const after = getAfterTimestamp(call.afterTimestamp || 0);
  const before = call.beforeTimestamp ? getBeforeTimestamp(false, call.beforeTimestamp) : getBeforeTimestamp(true);
  const maxGas = getMaxGas(call.maxGas || 0);
  const maxGasPrice = call.maxGasPrice ? getMaxGasPrice(call.maxGasPrice) : "00000005D21DBA00"; // 25 Gwei
  const flags = { ...defaultFlags, ...call.flags };
  const eip712 = getFlags(flags, true); // payment + eip712

  const getSessionId = () => {
    return `0x${group}${tnonce}${after}${before}${maxGas}${maxGasPrice}${eip712}`;
  };

  const hashedData = defaultAbiCoder.encode(
    ["bytes32", "address", "address", "uint256", "uint256"],
    [BATCH_TRANSFER_PACKED_TYPEHASH, call.token, call.to, call.value, getSessionId()]
  );

  return {
    signer: call.signer,
    token: call.token,
    to: call.to,
    value: call.value,
    // sessionId: getSessionId() + v.slice(2).padStart(2, "0"),
    sessionId: getSessionId(),
    hashedData: hashedData,
  };
};

export class BatchTransferPacked {
  calls: Array<Transfer>;
  web3: Web3;
  FactoryProxy: Contract;

  constructor(web3: Web3, contractAddress: string) {
    this.calls = [];
    this.web3 = web3;
    // @ts-ignore
    this.FactoryProxy = new web3.eth.Contract(FactoryProxyABI, contractAddress);
  }

  decodeData(data: string) {
    const decodedData = defaultAbiCoder.decode(["bytes32", "address", "address", "uint256", "uint256"], data);

    return {
      token: decodedData[1],
      to: decodedData[2],
      value: decodedData[3].toString(),
      sessionId: decodedData[4].toHexString(),
    };
  }

  async addTx(tx: TransferCall) {
    const data = await getBatchTransferPackedData(this.FactoryProxy, tx);
    this.calls = [...this.calls, data];
    return this.calls;
  }

  async addMultipleTx(tx: TransferCall[]) {
    const data = await Promise.all(tx.map((item, i) => getBatchTransferPackedData(this.FactoryProxy, item)));
    this.calls = [...this.calls, ...data];
    return this.calls;
  }
}
