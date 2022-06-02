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
  r: string;
  s: string;
  token: string;
  to: string;
  value: number;
  sessionId: string;
}

// DefaultFlag - "f0" // payment + eip712
const defaultFlags = {
  eip712: false,
  payment: true,
};

const getBatchTransferPackedData = async (web3: Web3, FactoryProxy: Contract, call: TransferCall) => {
  const FACTORY_DOMAIN_SEPARATOR = await FactoryProxy.methods.DOMAIN_SEPARATOR().call();
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
  const hashedData = {
    ...call,
    _hash: defaultAbiCoder.encode(
      ["bytes32", "address", "address", "uint256", "uint256"],
      [BATCH_TRANSFER_PACKED_TYPEHASH, call.token, call.to, call.value, getSessionId()]
    ),
  };

  const signature = await web3.eth.sign(
    FACTORY_DOMAIN_SEPARATOR + ethers.utils.keccak256(hashedData._hash).slice(2),
    call.signer
  );

  const r = signature.slice(0, 66);
  const s = "0x" + signature.slice(66, 130);
  const v = "0x" + signature.slice(130);

  return {
    signer: call.signer,
    r,
    s,
    token: call.token,
    to: call.to,
    value: call.value,
    sessionId: getSessionId() + v.slice(2).padStart(2, "0"),
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

  async addTx(tx: TransferCall) {
    const data = await getBatchTransferPackedData(this.web3, this.FactoryProxy, tx);
    this.calls = [...this.calls, data];
    return this.calls;
  }

  async addMultipleTx(tx: TransferCall[]) {
    const data = await Promise.all(tx.map((item, i) => getBatchTransferPackedData(this.web3, this.FactoryProxy, item)));
    this.calls = [...this.calls, ...data];
    return this.calls;
  }

  removeTx(txIndex: number) {
    if (this.calls.length === 0) {
      throw new Error("No calls have been added");
    }
    this.calls.splice(txIndex, 1);
    return this.calls;
  }

  async execute(activator: string, groupId: number, silentRevert: boolean) {
    const calls = this.calls;

    if (calls.length === 0) {
      throw new Error("No calls haven't been added");
    }

    return await this.FactoryProxy.methods.batchTransferPacked_(calls, groupId, silentRevert).send({ from: activator });
  }
}
