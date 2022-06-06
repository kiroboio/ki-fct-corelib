import { ethers } from "ethers";
import { TypedDataUtils } from "ethers-eip712";
import { defaultAbiCoder, toUtf8Bytes } from "ethers/lib/utils";
import Web3 from "web3";
import { Sign } from "web3-eth-accounts";
import Contract from "web3/eth/contract";
import FactoryProxyABI from "../abi/factoryProxy_.abi.json";
import {
  getGroupId,
  getMaxGasPrice,
  getNonce,
  getAfterTimestamp,
  getBeforeTimestamp,
  getMaxGas,
  getFlags,
} from "../helpers";

const web3 = new Web3();

// Most likely the data structure is going to be different

interface TransferFlags {
  eip712?: boolean;
  staticCall?: boolean;
  cancelable?: boolean;
  payment?: boolean;
}
interface TransferCall {
  token: string;
  tokenEnsHash?: string;
  to: string;
  toEnsHash?: string;
  groupId: number;
  nonce: number;
  value: number;
  signer: string;

  afterTimestamp?: number;
  beforeTimestamp?: number;
  maxGas?: number;
  maxGasPrice?: number;
  flags?: TransferFlags;
}

interface Transfer {
  token: string;
  tokenEnsHash: string;
  to: string;
  toEnsHash: string;
  value: number;
  signer: string;
  sessionId: string;
  typedData: object;
  hashedData: string;
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

// DefaultFlag - "f1" // payment + eip712
const defaultFlags = {
  eip712: true,
  payment: true,
};

const getBatchTransferData = async (
  web3: Web3,
  FactoryProxy: Contract,
  factoryProxyAddress: string,
  call: TransferCall
) => {
  const group = getGroupId(call.groupId);
  const tnonce = getNonce(call.nonce);
  const after = getAfterTimestamp(call.afterTimestamp || 0);
  const before = call.beforeTimestamp ? getBeforeTimestamp(false, call.beforeTimestamp) : getBeforeTimestamp(true);
  const maxGas = getMaxGas(call.maxGas || 0);
  const maxGasPrice = call.maxGasPrice ? getMaxGasPrice(call.maxGasPrice) : "00000005D21DBA00"; // 25 Gwei
  const flags = { ...defaultFlags, ...call.flags };
  const eip712 = getFlags(flags, true);

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
      refund: flags.payment,
    },
  };
  const hashedData = ethers.utils.hexlify(
    TypedDataUtils.encodeData(typedData, typedData.primaryType, typedData.message)
  );

  return {
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
    sessionId: getSessionIdERC20(),
    hashedData,
    typedData,
    // sessionId: getSessionIdERC20() + signature.v.slice(2).padStart(2, "0"),
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

  decodeData(data: string) {
    const decodedData = defaultAbiCoder.decode(
      [
        "bytes32",
        "address",
        "bytes32",
        "address",
        "bytes32",
        "uint256",
        "uint64",
        "uint40",
        "uint40",
        "uint32",
        "uint64",
        "bool",
      ],
      data
    );

    return {
      token: decodedData[1],
      tokenEnsHash:
        decodedData[2] !== "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470"
          ? decodedData[2]
          : undefined,
      to: decodedData[3],
      toEnsHash:
        decodedData[4] !== "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470"
          ? decodedData[4]
          : undefined,
      value: decodedData[5].toString(),
      nonce: decodedData[6].toHexString(),
      afterTimestamp: decodedData[7],
      beforeTimestamp: decodedData[8],
      maxGas: decodedData[9],
      maxGasPrice: decodedData[10].toString(),
      payable: decodedData[11],
    };
  }

  async addTx(tx: TransferCall) {
    const data = await getBatchTransferData(this.web3, this.FactoryProxy, this.factoryProxyAddress, tx);
    this.calls = [...this.calls, data];
    return this.calls;
  }

  async addMultipleTx(txs: TransferCall[]) {
    const data = await Promise.all(
      txs.map((tx) => getBatchTransferData(this.web3, this.FactoryProxy, this.factoryProxyAddress, tx))
    );
    this.calls = [...this.calls, ...data];
    return this.calls;
  }
}
