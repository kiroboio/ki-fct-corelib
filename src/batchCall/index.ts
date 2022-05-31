import { ethers } from "ethers";
import { TypedDataUtils } from "ethers-eip712";
import { defaultAbiCoder, toUtf8Bytes } from "ethers/lib/utils";
import Web3 from "web3";
import Contract from "web3/eth/contract";
import FactoryProxyABI from "../abi/factoryProxy_.abi.json";
import {
  getAfterTimestamp,
  getBeforeTimestamp,
  getGroupId,
  getMaxGas,
  getMaxGasPrice,
  manageCallFlags,
} from "../helpers";

// Most likely the data structure is going to be different

interface BatchCallInputData {
  value: string;
  to: string;
  signer: string;
  groupId: number;
  data?: string;
  methodInterface?: string;
  methodData?: Object;
  signerPrivateKey?: string;
  toEnsHash?: string;
  viewOnly?: boolean;
  afterTimestamp?: number;
  beforeTimestamp?: number;
  maxGas?: number;
  maxGasPrice?: number;
}

interface BatchCallData {
  r: string;
  s: string;
  typeHash: string;
  to: string;
  ensHash: string;
  value: string;
  sessionId: string;
  signer: string;
  functionSignature: string;
  data: string;
}

const getTypeHash = (typedData) => {
  const m2 = TypedDataUtils.typeHash(typedData.types, typedData.primaryType);
  return ethers.utils.hexZeroPad(ethers.utils.hexlify(m2), 32);
};

const getTypedDataDomain = async (web3: Web3, factoryProxy: Contract, factoryProxyAddress: string) => {
  const chainId = await factoryProxy.methods.CHAIN_ID().call();
  return {
    name: await factoryProxy.methods.NAME().call(), // await factoryProxy.NAME(),
    version: await factoryProxy.methods.VERSION().call(), // await factoryProxy.VERSION(),
    chainId: Number("0x" + web3.utils.toBN(chainId).toString("hex")), // await web3.eth.getChainId(),
    verifyingContract: factoryProxyAddress,
    salt: await factoryProxy.methods.uid().call(),
  };
};

const getBatchCallData = async (
  web3: Web3,
  factoryProxy: Contract,
  factoryProxyAddress: string,
  call: BatchCallInputData,
  i: number
) => {
  const group = getGroupId(call.groupId);
  const tnonce = "00000001" + i.toString(16).padStart(2, "0");
  const after = getAfterTimestamp(call.afterTimestamp || 0);
  const before = call.beforeTimestamp ? getBeforeTimestamp(false, call.beforeTimestamp) : getBeforeTimestamp(true);
  const maxGas = getMaxGas(call.maxGas || 0);
  const maxGasPrice = call.maxGasPrice ? getMaxGasPrice(call.maxGasPrice) : "00000005D21DBA00"; // 25 Gwei
  const eip712 = "f3"; // ordered, payment, eip712

  const getSessionId = () => `0x${group}${tnonce}${after}${before}${maxGas}${maxGasPrice}${eip712}`;

  const methodParams = call.methodData
    ? {
        method_params_offset: "0x60", // '0x1c0', // '480', // 13*32
        method_params_length: "0x40",
        ...call.methodData,
      }
    : {};

  const contractType = call.methodData
    ? [
        { name: "method_params_offset", type: "uint256" },
        { name: "method_params_length", type: "uint256" },
        { name: "to", type: "address" },
        { name: "token_amount", type: "uint256" },
      ]
    : [];

  const typedData = {
    types: {
      EIP712Domain: [
        { name: "name", type: "string" },
        { name: "version", type: "string" },
        { name: "chainId", type: "uint256" },
        { name: "verifyingContract", type: "address" },
        { name: "salt", type: "bytes32" },
      ],
      BatchCall_: [{ name: "transaction", type: "Transaction_" }, ...contractType],
      Transaction_: [
        { name: "call_address", type: "address" },
        { name: "call_ens", type: "string" },
        { name: "eth_value", type: "uint256" },
        { name: "nonce", type: "uint64" },
        { name: "valid_from", type: "uint40" },
        { name: "expires_at", type: "uint40" },
        { name: "gas_limit", type: "uint32" },
        { name: "gas_price_limit", type: "uint64" },
        { name: "view_only", type: "bool" },
        { name: "refund", type: "bool" },
        { name: "method_interface", type: "string" },
      ],
    },
    primaryType: "BatchCall_",
    domain: await getTypedDataDomain(web3, factoryProxy, factoryProxyAddress),
    message: {
      transaction: {
        call_address: call.to,
        call_ens: call.toEnsHash || "",
        eth_value: call.value,
        nonce: "0x" + group + tnonce,
        valid_from: Number.parseInt("0x" + after),
        expires_at: Number.parseInt("0x" + before),
        gas_limit: Number.parseInt("0x" + maxGas),
        gas_price_limit: Number.parseInt("0x" + maxGasPrice),
        view_only: false,
        refund: true,
        method_interface: call.methodInterface || "",
      },
      ...methodParams,
    },
  };

  const messageDigest = TypedDataUtils.encodeDigest(typedData);

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
    ...signature,
    typeHash: getTypeHash(typedData),
    to: call.to,
    ensHash: call.toEnsHash
      ? web3.utils.sha3(call.toEnsHash)
      : "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470",
    value: call.value,
    sessionId: getSessionId() + signature.v.slice(2).padStart(2, "0"),
    signer: call.signer,
    functionSignature: call.methodInterface
      ? web3.utils.sha3(call.methodInterface)
      : "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470",
    data: call.data ? "0x" + call.data.slice(10) : "0x",
  };
};

export class BatchCall {
  calls: Array<BatchCallData>;
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

  async addTx(tx: BatchCallInputData) {
    const data = await getBatchCallData(this.web3, this.FactoryProxy, this.factoryProxyAddress, tx, this.calls.length);
    this.calls = [...this.calls, data];
    return this.calls;
  }

  async addMultipleTx(txs: BatchCallInputData[]) {
    const data = await Promise.all(
      txs.map((tx, i) =>
        getBatchCallData(this.web3, this.FactoryProxy, this.factoryProxyAddress, tx, this.calls.length + (i + 1))
      )
    );
    this.calls = [...this.calls, ...data];
    return data;
  }

  async execute(activator: string, groupId: number, silentRevert: boolean) {
    const calls = this.calls;

    if (calls.length === 0) {
      throw new Error("No call have been added.");
    }

    return await this.FactoryProxy.methods.batchCall_(calls, groupId, silentRevert).send({ from: activator });
  }
}
