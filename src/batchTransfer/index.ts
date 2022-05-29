import { ethers } from "ethers";
import { TypedDataUtils } from "ethers-eip712";
import { defaultAbiCoder, toUtf8Bytes } from "ethers/lib/utils";
import Web3 from "web3";
import Contract from "web3/eth/contract";
import FactoryProxyABI from "../abi/factoryProxy_.abi.json";
import { getGroupId, getMaxGasPrice, getNonce } from "../helpers";

const web3 = new Web3();

// Most likely the data structure is going to be different
interface TransferCall {
  token: string;
  tokenEnsHash: string | null;
  to: string;
  toEnsHash: string | null;
  groupId: number;
  value: number;
  signer: string;
}

interface Transfer {
  token: string;
  tokenEnsHash: string;
  to: string;
  toEnsHash: string;
  value: number;
  signer: string;
  r: string;
  s: string;
  sessionId: string;
}

const getContract = (web3, addr) => {
  // @ts-ignore
  return new web3.eth.Contract(FactoryProxyABI, addr);
};

// Move to seperate folder/file where all the helper functions will be located
const getTypedDataDomain = async (factoryProxy, factoryProxyAddress) => {
  const chainId = await factoryProxy.methods.CHAIN_ID().call();
  return {
    name: await factoryProxy.methods.NAME().call(), // await factoryProxy.NAME(),
    version: await factoryProxy.methods.VERSION().call(), // await factoryProxy.VERSION(),
    chainId: "0x" + web3.utils.toBN(chainId).toString("hex"), // await web3.eth.getChainId(),
    verifyingContract: factoryProxyAddress,
    salt: await factoryProxy.methods.uid().call(),
  };
};

const batchTransferTypedData = {
  types: {
    EIP712Domain: [
      { name: "name", type: "string" },
      { name: "version", type: "string" },
      { name: "chainId", type: "uint256" },
      { name: "verifyingContract", type: "address" },
      { name: "salt", type: "bytes32" },
    ],
    BatchTransfer_: [
      { name: "token_address", type: "address" },
      { name: "token_ens", type: "string" },
      { name: "to", type: "address" },
      { name: "to_ens", type: "string" },
      { name: "value", type: "uint256" },
      { name: "nonce", type: "uint64" },
      { name: "valid_from", type: "uint40" },
      { name: "expires_at", type: "uint40" },
      { name: "gas_limit", type: "uint32" },
      { name: "gas_price_limit", type: "uint64" },
      { name: "refund", type: "bool" },
    ],
  },
  primaryType: "BatchTransfer_",
};

const getBatchTransferData = async (web3: Web3, call: TransferCall, i: number, factoryProxyAddress: string) => {
  // @ts-ignore
  const FactoryProxy = new web3.eth.Contract(FactoryProxyABI, factoryProxyAddress);

  const groupERC20 = getGroupId(call.groupId);
  const tnonceERC20 = getNonce(i);
  const afterERC20 = "0000000000";
  const beforeERC20 = "ffffffffff";
  const maxGasERC20 = "00000000";
  const maxGasPriceERC20 = getMaxGasPrice(50000000000);
  const eip712ERC20 = "f1"; // payment + eip712

  // const eip712 = `f1`; // payment + eip712, need to make it editable from user side
  // const eip712 = `${payable}${cancelable}`; // payment + eip712, need to make it editable from user side

  const getSessionIdERC20 = () =>
    `0x${groupERC20}${tnonceERC20}${afterERC20}${beforeERC20}${maxGasERC20}${maxGasPriceERC20}${eip712ERC20}`;

  const typedData = {
    ...batchTransferTypedData,
    domain: await getTypedDataDomain(FactoryProxy, factoryProxyAddress),
    message: {
      nonce: "0x" + groupERC20 + tnonceERC20,
      token_address: call.token,
      token_ens: call.tokenEnsHash,
      to: call.to,
      to_ens: call.toEnsHash,
      value: call.value,
      valid_from: "0x" + afterERC20,
      expires_at: "0x" + beforeERC20,
      gas_limit: "0x" + maxGasERC20,
      gas_price_limit: "0x" + maxGasPriceERC20,
      refund: true,
    },
  };

  // @ts-ignore
  const digest = TypedDataUtils.encodeDigest(typedData);
  let signature = await web3.eth.sign(ethers.utils.hexlify(digest), call.signer);

  const r = signature.slice(0, 66);
  const s = "0x" + signature.slice(66, 130);
  const v = "0x" + signature.slice(130);

  return {
    r,
    s,
    signer: call.signer,
    token: call.token,
    tokenEnsHash: call.tokenEnsHash
      ? ethers.utils.keccak256(toUtf8Bytes(call.tokenEnsHash))
      : "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470",
    to: call.to,
    toEnsHash: call.toEnsHash
      ? ethers.utils.keccak256(toUtf8Bytes(call.toEnsHash))
      : "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470",
    value: call.value,
    sessionId: getSessionIdERC20() + v.slice(2).padStart(2, "0"),
  };
};

export class BatchTransfer {
  calls: Array<Transfer>;
  constructor() {
    this.calls = [];
  }

  async addTx(web3: Web3, factoryProxyAddress: string, tx: TransferCall) {
    const data = await getBatchTransferData(web3, tx, this.calls.length, factoryProxyAddress);
    this.calls = [...this.calls, data];
  }

  async execute(web3: Web3, factoryProxyAddress: string, groupId: number, activator: string) {
    const calls = this.calls;

    if (calls.length === 0) {
      throw new Error("No calls haven't been added");
    }

    const FactoryContract = getContract(web3, factoryProxyAddress);

    return await FactoryContract.methods.batchTransfer_(calls, groupId, true).send({ from: activator });
  }
}
