import { ethers } from "ethers";
import { TypedDataUtils } from "ethers-eip712";
import { defaultAbiCoder, toUtf8Bytes } from "ethers/lib/utils";
import Web3 from "web3";
import { Sign } from "web3-eth-accounts";
import Contract from "web3/eth/contract";
import FactoryProxyABI from "../abi/factoryProxy_.abi.json";
import { getGroupId, getMaxGasPrice, getNonce } from "../helpers";

const web3 = new Web3();

// Most likely the data structure is going to be different
interface TransferCall {
  token: string;
  to: string;
  groupId: number;
  value: number;
  signer: string;
  signerPrivateKey?: string;
  tokenEnsHash?: string;
  toEnsHash?: string;
  maxGasPrice?: number;
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

// Move to seperate folder/file where all the helper functions will be located
const getTypedDataDomain = async (factoryProxy: Contract, factoryProxyAddress: string) => {
  const chainId = await factoryProxy.methods.CHAIN_ID().call();
  return {
    name: await factoryProxy.methods.NAME().call(), // await factoryProxy.NAME(),
    version: await factoryProxy.methods.VERSION().call(), // await factoryProxy.VERSION(),
    chainId: Number("0x" + web3.utils.toBN(chainId).toString("hex")), // await web3.eth.getChainId(),
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

const getBatchTransferData = async (
  web3: Web3,
  FactoryProxy: Contract,
  factoryProxyAddress: string,
  call: TransferCall,
  i: number
) => {
  const group = getGroupId(call.groupId);
  const tnonce = getNonce(i);
  const after = "0000000000";
  const before = "ffffffffff";
  const maxGas = "00000000";
  const maxGasPrice = call.maxGasPrice ? getMaxGasPrice(call.maxGasPrice) : "00000005D21DBA00"; // 25 Gwei
  const eip712 = "f1"; // payment + eip712

  // const eip712 = `f1`; // payment + eip712, need to make it editable from user side
  // const eip712 = `${payable}${cancelable}`; // payment + eip712, need to make it editable from user side

  const getSessionIdERC20 = () => `0x${group}${tnonce}${after}${before}${maxGas}${maxGasPrice}${eip712}`;

  const typedData = {
    ...batchTransferTypedData,
    domain: await getTypedDataDomain(FactoryProxy, factoryProxyAddress),
    message: {
      token_address: call.token,
      token_ens: call.tokenEnsHash || "",
      to: call.to,
      to_ens: call.toEnsHash || "",
      value: call.value,
      nonce: "0x" + group + tnonce,
      valid_from: "0x" + after,
      expires_at: "0x" + before,
      gas_limit: "0x" + maxGas,
      gas_price_limit: "0x" + maxGasPrice,
      refund: true,
    },
  };

  const messageDigest = TypedDataUtils.encodeDigest(typedData);
  const messageDigestHex = ethers.utils.hexlify(messageDigest);

  let signature;

  if (call.signerPrivateKey) {
    const signingKey = new ethers.utils.SigningKey(call.signerPrivateKey);
    signature = signingKey.signDigest(messageDigest);
    signature.v = "0x" + signature.v.toString(16);
  } else if (window && "ethereum" in window) {
    // Do a request for MetaMask to sign EIP712
  } else {
    throw new Error("Browser doesn't have a Metamask and signerPrivateKey hasn't been provided");
  }

  return {
    r: signature.r,
    s: signature.s,
    signer: call.signer,
    token: call.token,
    tokenEnsHash: call.tokenEnsHash
      ? web3.utils.sha3(call.tokenEnsHash)
      : "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470",
    to: call.to,
    toEnsHash: call.toEnsHash
      ? web3.utils.sha3(call.toEnsHash)
      : "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470",
    value: call.value,
    sessionId: getSessionIdERC20() + signature.v.slice(2).padStart(2, "0"),
  };
};

export class BatchTransfer {
  calls: Array<Transfer>;
  web3: Web3;
  FactoryProxy: Contract;
  factoryProxyAddress: string;
  constructor(web3: Web3, contractAddress: string) {
    this.calls = [];
    this.web3 = web3;
    // @ts-ignore
    this.FactoryProxy = new web3.eth.Contract(FactoryProxyABI, contractAddress);
    this.factoryProxyAddress = contractAddress;
  }

  async addTx(tx: TransferCall) {
    const data = await getBatchTransferData(
      this.web3,
      this.FactoryProxy,
      this.factoryProxyAddress,
      tx,
      this.calls.length
    );
    this.calls = [...this.calls, data];
  }

  async execute(activator: string, groupId: number, silentRevert: boolean) {
    const calls = this.calls;

    if (calls.length === 0) {
      throw new Error("No calls haven't been added");
    }

    return await this.FactoryProxy.methods.batchTransfer_(calls, groupId, silentRevert).send({ from: activator });
  }
}
