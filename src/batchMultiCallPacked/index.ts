import { ethers } from "ethers";
import { TypedDataUtils } from "ethers-eip712";
import { defaultAbiCoder, toUtf8Bytes } from "ethers/lib/utils";
import Web3 from "web3";
import Contract from "web3/eth/contract";
import FactoryProxyABI from "../abi/factoryProxy_.abi.json";
import MinERC20ABI from "../abi/minERC20.abi.json";
import { getGroupId } from "../helpers";

const getContract = (web3, addr) => {
  // @ts-ignore
  return new web3.eth.Contract(FactoryProxyABI, addr);
};

// Most likely the data structure is going to be different
interface MultiCallInterface {
  value: string;
  to: string;
  data: string;
  gasLimit?: number;
  onFailStop?: boolean;
  onFailContinue?: boolean;
  onSuccessStop?: boolean;
  onSuccessRevert?: boolean;
}

interface MultiCallPackedInterface {
  groupId: number;
  signer: string;
  mcall: MultiCallInterface[];
}

interface MultiCall {
  value: string;
  to: string;
  gasLimit: number;
  flags: number;
  data: string;
}

interface MultiCallPacked {
  r: string;
  s: string;
  sessionId: string;
  signer: string;
  v: string;
  mcall: MultiCall[];
}

const getMultiCallPackedData = async (web3: Web3, factoryProxy, call: MultiCallPackedInterface, i: number) => {
  const FACTORY_DOMAIN_SEPARATOR = await factoryProxy.methods.DOMAIN_SEPARATOR().call();
  const typeHash = await factoryProxy.methods.BATCH_MULTI_CALL_TYPEHASH_().call();

  const group = getGroupId(call.groupId);
  const tnonce = "00000000";
  const after = "0000000000";
  const before = "ffffffffff";
  const maxGas = "00000000";
  const maxGasPrice = "0000000ba43b7400";
  const eip712 = "f000"; // not-ordered, payment

  const getSessionIdERC20 = (index) =>
    `0x${group}${tnonce}${index.toString(16).padStart(2, "0")}${after}${before}${maxGas}${maxGasPrice}${eip712}`;

  const mcallHash = defaultAbiCoder.encode(
    ["(bytes32,address,uint256,uint256,bytes)[]"],
    [call.mcall.map((item) => [typeHash, item.to, item.value, getSessionIdERC20(i), item.data])]
  );

  const signature = await web3.eth.sign(FACTORY_DOMAIN_SEPARATOR + web3.utils.sha3(mcallHash).slice(2), call.signer);
  const r = signature.slice(0, 66);
  const s = "0x" + signature.slice(66, 130);
  const v = "0x" + signature.slice(130);

  return {
    mcall: call.mcall.map((item) => ({
      value: item.value,
      to: item.to,
      gasLimit: item.gasLimit || 0,
      flags: 0x0,
      data: item.data,
    })),
    r,
    s,
    v,
    sessionId: getSessionIdERC20(i),
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

  async addPackedMulticall(tx: MultiCallPackedInterface) {
    const data = await getMultiCallPackedData(this.web3, this.FactoryProxy, tx, this.calls.length);
    this.calls = [...this.calls, data];
    return this.calls;
  }

  removePackedMulticall(index: number) {
    if (this.calls.length === 0) {
      throw new Error("No calls have been added");
    }
    this.calls.splice(index, 1);
    return this.calls;
  }

  async addMultiplePackedMulticalls(txs: MultiCallPackedInterface[]) {
    const data = await Promise.all(
      txs.map((tx, i) => getMultiCallPackedData(this.web3, this.FactoryProxy, tx, this.calls.length + (i + 1)))
    );
    this.calls = [...this.calls, ...data];
    return this.calls;
  }

  async execute(groupId: number, activator: string) {
    const calls = this.calls;

    if (calls.length === 0) {
      throw new Error("No calls have been added");
    }

    return await this.FactoryProxy.methods.batchMultiCallPacked_(calls, groupId).send({ from: activator });
  }
}
