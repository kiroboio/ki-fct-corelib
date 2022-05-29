import { ethers } from "ethers";
import { TypedDataUtils } from "ethers-eip712";
import { defaultAbiCoder, toUtf8Bytes } from "ethers/lib/utils";
import Web3 from "web3";
import Contract from "web3/eth/contract";
import FactoryProxyABI from "../abi/factoryProxy_.abi.json";

const web3 = new Web3();
const getContract = (web3, addr) => {
  // @ts-ignore
  return new web3.eth.Contract(FactoryProxyABI, addr);
};

// Most likely the data structure is going to be different
interface TransferCall {
  token: string;
  to: string;
  value: number;
  signer: string;
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

const getBatchTransferPackedData = async (web3: Web3, call: TransferCall, i: number, factoryProxyAddress) => {
  const FactoryProxy = getContract(web3, factoryProxyAddress);
  const FACTORY_DOMAIN_SEPARATOR = await FactoryProxy.methods.DOMAIN_SEPARATOR().call();
  const BATCH_TRANSFER_PACKED_TYPEHASH = await FactoryProxy.methods.BATCH_TRANSFER_PACKED_TYPEHASH_().call();

  const group = "00000C"; // Has to be a way to determine group dynamically
  const tnonce = "00000000";
  const after = "0000000000";
  const before = "ffffffffff";
  const maxGas = "00000000";
  const maxGasPrice = "0000000ba43b7400";
  const eip712ERC20 = "f0"; // payment + eip712

  const getSessionId = (index: number) => {
    return `0x${group}${tnonce}${index
      .toString(16)
      .padStart(2, "0")}${after}${before}${maxGas}${maxGasPrice}${eip712ERC20}`;
  };
  const hashedData = {
    ...call,
    _hash: defaultAbiCoder.encode(
      ["bytes32", "address", "address", "uint256", "uint256"],
      [BATCH_TRANSFER_PACKED_TYPEHASH, call.token, call.to, call.value, getSessionId(i)]
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
    sessionId: getSessionId(i) + v.slice(2).padStart(2, "0"),
  };
};

export class BatchTransferPacked {
  calls: Array<Transfer>;
  constructor() {
    this.calls = [];
  }

  async addTx(web3: Web3, factoryProxyAddress: string, tx: TransferCall) {
    const data = await getBatchTransferPackedData(web3, tx, this.calls.length, factoryProxyAddress);
    this.calls = [...this.calls, data];
  }

  async execute(web3: Web3, factoryProxyAddress: string, activator: string) {
    const calls = this.calls;

    if (calls.length === 0) {
      throw new Error("No calls haven't been added");
    }

    const FactoryContract = getContract(web3, factoryProxyAddress);

    const data = await FactoryContract.methods.batchTransferPacked_(calls, 12, true).send({ from: activator });
    console.log(data);
  }
}
