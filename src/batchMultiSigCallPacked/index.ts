import { defaultAbiCoder, keccak256, toUtf8Bytes } from "ethers/lib/utils";
import Web3 from "web3";
import Contract from "web3/eth/contract";
import FactoryProxyABI from "../abi/factoryProxy_.abi.json";
import {
  getAfterTimestamp,
  getBeforeTimestamp,
  getGroupId,
  getMaxGas,
  getMaxGasPrice,
  getNonce,
  manageCallFlags,
} from "../helpers";

interface MultiCallFlags {
  viewOnly: boolean;
  continueOnFail: boolean;
  stopOnFail: boolean;
  stopOnSuccess: boolean;
  revertOnSuccess: boolean;
}

interface CallInput {
  value: string;
  to: string;
  data: string;
  signer: string;
  gasLimit?: number;
  flags?: MultiCallFlags;
}

interface BatchMultiSigCallPackedInput {
  groupId: number;
  nonce: number;
  signers: string[];
  afterTimestamp?: number;
  beforeTimestamp?: number;
  maxGas?: number;
  maxGasPrice?: number;
  multiCalls: CallInput[];
}

interface Signature {
  r: string;
  s: string;
  v: string;
}

interface PackedMSCall {
  value: string;
  signer: string;
  gasLimit: number;
  flags: string;
  to: string;
  data: string;
}

interface BatchMultiSigCallPackedData {
  sessionId: string;
  signatures: Signature[];
  mcall: PackedMSCall[];
}

const getMultiSigCallPackedData = async (web3: Web3, factoryProxy: Contract, call: BatchMultiSigCallPackedInput) => {
  const batchMultiSigTypeHash = await factoryProxy.methods.BATCH_MULTI_SIG_CALL_TYPEHASH_().call();
  const txTypeHash = await factoryProxy.methods.PACKED_BATCH_MULTI_SIG_CALL_TRANSACTION_TYPEHASH_().call();
  const limitsTypeHash = await factoryProxy.methods.PACKED_BATCH_MULTI_SIG_CALL_LIMITS_TYPEHASH_().call();
  const domainSeparator = await factoryProxy.methods.DOMAIN_SEPARATOR().call();

  const group = getGroupId(call.groupId);
  const tnonce = getNonce(call.nonce);
  const after = getAfterTimestamp(call.afterTimestamp || 0);
  const before = call.beforeTimestamp ? getBeforeTimestamp(false, call.beforeTimestamp) : getBeforeTimestamp(true);
  const maxGas = getMaxGas(call.maxGas || 0);
  const maxGasPrice = call.maxGasPrice ? getMaxGasPrice(call.maxGasPrice) : "00000005D21DBA00"; // 25 Gwei
  const eip712 = "f000"; // not-ordered, payment

  const getSessionId = () => `0x${group}${tnonce}${after}${before}${maxGas}${maxGasPrice}${eip712}`;

  const encodeLimit = keccak256(defaultAbiCoder.encode(["bytes32", "uint256"], [limitsTypeHash, getSessionId()]));
  const encodedTxs = call.multiCalls.map((item) =>
    keccak256(
      defaultAbiCoder.encode(
        ["bytes32", "address", "address", "uint256", "uint32", "uint16", "bytes"],
        [
          txTypeHash,
          item.signer,
          item.to,
          item.value,
          item.gasLimit || 0,
          item.flags ? manageCallFlags(item.flags) : "0x0",
          item.data,
        ]
      )
    )
  );
  const fullEncode = defaultAbiCoder.encode(
    ["bytes32", "bytes32", ...encodedTxs.map(() => "bytes32")],
    [batchMultiSigTypeHash, encodeLimit, ...encodedTxs.map((item) => item)]
  );

  const signatures = await Promise.all(
    call.signers.map((signer) => web3.eth.sign(domainSeparator + web3.utils.sha3(fullEncode).slice(2), signer))
  );

  return {
    signatures: signatures.map((signature) => ({
      r: signature.slice(0, 66),
      s: "0x" + signature.slice(66, 130),
      v: "0x" + signature.slice(130),
    })),
    sessionId: getSessionId(),
    mcall: call.multiCalls.map((item) => ({
      value: item.value,
      signer: item.signer,
      gasLimit: item.gasLimit || 0,
      flags: item.flags ? manageCallFlags(item.flags) : "0x0",
      to: item.to,
      data: item.data,
    })),
  };
};

export class BatchMultiSigCallPacked {
  calls: Array<BatchMultiSigCallPackedData>;
  web3: Web3;
  FactoryProxy: Contract;
  constructor(web3: Web3, contractAddress: string) {
    this.calls = [];
    this.web3 = web3;
    // @ts-ignore
    this.FactoryProxy = new web3.eth.Contract(FactoryProxyABI, contractAddress);
  }

  async addPackedMulticall(tx: BatchMultiSigCallPackedInput) {
    const data = await getMultiSigCallPackedData(this.web3, this.FactoryProxy, tx);
    this.calls = [...this.calls, data];
    return this.calls;
  }

  async addMultiplePackedMulticall(txs: BatchMultiSigCallPackedInput[]) {
    const data = await Promise.all(txs.map((tx) => getMultiSigCallPackedData(this.web3, this.FactoryProxy, tx)));
    this.calls = [...this.calls, ...data];
    return this.calls;
  }

  async execute(activator: string, groupId: number) {
    const calls = this.calls;

    if (calls.length === 0) {
      throw new Error("No calls have been added");
    }

    return await this.FactoryProxy.methods.batchMultiSigCallPacked_(calls, groupId).send({ from: activator });
  }
}
