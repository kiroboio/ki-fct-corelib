import { ethers } from "ethers";
import { TypedDataUtils } from "ethers-eip712";
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

// Most likely the data structure is going to be different

interface Flags {
  staticCall?: boolean;
  cancelable?: boolean;
  payment?: boolean;
}

interface Params {
  name: string;
  type: string;
  value: string;
}

interface BatchCallInputData {
  value: string;
  to: string;
  toEnsHash?: string;
  signer: string;

  groupId: number;
  nonce: number;

  data?: string;
  method?: string;
  params?: Params[];

  afterTimestamp?: number;
  beforeTimestamp?: number;
  maxGas?: number;
  maxGasPrice?: number;
  flags?: Flags;
}

interface BatchCallData {
  typeHash: string;
  to: string;
  ensHash: string;
  value: string;
  sessionId: string;
  signer: string;
  functionSignature: string;
  data: string;
  typedData: Object;
  hashedMessage: string;
  hashedTxMessage: string;
}

const getMethodInterface = (call: BatchCallInputData) => {
  return `${call.method}(${call.params.map((item) => item.type).join(",")})`;
};

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

// DefaultFlag - "f1" // payment + eip712
const defaultFlags = {
  eip712: true,
  payment: true,
  staticCall: false,
};

const getBatchCallData = async (
  web3: Web3,
  factoryProxy: Contract,
  factoryProxyAddress: string,
  call: BatchCallInputData
) => {
  const group = getGroupId(call.groupId);
  const tnonce = getNonce(call.nonce);
  const after = getAfterTimestamp(call.afterTimestamp || 0);
  const before = call.beforeTimestamp ? getBeforeTimestamp(false, call.beforeTimestamp) : getBeforeTimestamp(true);
  const maxGas = getMaxGas(call.maxGas || 0);
  const maxGasPrice = call.maxGasPrice ? getMaxGasPrice(call.maxGasPrice) : "00000005D21DBA00"; // 25 Gwei
  const flags = { ...defaultFlags, ...call.flags };
  const eip712 = getFlags(flags, true);

  const getSessionId = () => `0x${group}${tnonce}${after}${before}${maxGas}${maxGasPrice}${eip712}`;

  const methodParams = call.params
    ? {
        method_params_offset: "0x60", // '0x1c0', // '480', // 13*32
        method_params_length: "0x40",
        ...call.params.reduce((acc, item) => ({ ...acc, [item.name]: item.value }), {}),
      }
    : {};

  const contractType = call.params
    ? [
        { name: "method_params_offset", type: "uint256" },
        { name: "method_params_length", type: "uint256" },
        ...call.params.reduce((acc, item) => [...acc, { name: item.name, type: item.type }], []),
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
        view_only: flags.staticCall,
        refund: flags.payment,
        method_interface: call.method ? getMethodInterface(call) : "",
      },
      ...methodParams,
    },
  };

  const hashedMessage = ethers.utils.hexlify(
    TypedDataUtils.encodeData(typedData, typedData.primaryType, typedData.message)
  );

  const hashedTxMessage = ethers.utils.hexlify(
    TypedDataUtils.encodeData(typedData, "Transaction_", typedData.message.transaction)
  );

  const encodedMethodParamsData = `0x${
    call.method
      ? defaultAbiCoder.encode([getMethodInterface(call)], [call.params.map((item) => item.value)]).slice(2)
      : ""
  }`;

  return {
    typeHash: getTypeHash(typedData),
    to: call.to,
    ensHash: call.toEnsHash
      ? web3.utils.sha3(call.toEnsHash)
      : "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470",
    value: call.value,
    // sessionId: getSessionId() + signature.v.slice(2).padStart(2, "0"),
    sessionId: getSessionId(),
    signer: call.signer,
    functionSignature: call.method
      ? web3.utils.sha3(getMethodInterface(call))
      : "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470",
    data: encodedMethodParamsData,
    typedData,
    hashedMessage,
    hashedTxMessage,
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

  verifyMessage(message: string, signature: string, address: string) {
    const messageAddress = this.web3.eth.accounts.recover(message, signature);
    return messageAddress.toLowerCase() === address.toLowerCase();
  }

  decodeData(data: string, txData: string, params?) {
    const decodedData = params
      ? defaultAbiCoder.decode(["bytes32", "bytes32", "uint256", "uint256", ...params.map((item) => item.type)], data)
      : defaultAbiCoder.decode(["bytes32", "bytes32"], data);

    const decodedTxData = defaultAbiCoder.decode(
      [
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
        "bool",
        "bytes32",
      ],
      txData
    );

    const defaultReturn = {
      typeHash: decodedData[0],
      txHash: decodedData[1],
      transaction: {
        to: decodedTxData[1],
        toEnsHash:
          decodedTxData[2] !== "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470"
            ? decodedTxData[2]
            : undefined,
        value: decodedTxData[3].toString(),
        nonce: decodedTxData[4].toHexString(),
        afterTimestamp: decodedTxData[5],
        beforeTimestamp: decodedTxData[6],
        maxGas: decodedTxData[7],
        maxGasPrice: decodedTxData[8].toString(),
        staticCall: decodedTxData[9],
        payment: decodedTxData[10],
        methodHash:
          decodedTxData[11] !== "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470"
            ? decodedTxData[11]
            : undefined,
      },
    };

    const extraData = params
      ? params.reduce(
          (acc, item, i) => ({
            ...acc,
            [item.name]: ethers.BigNumber.isBigNumber(decodedData[4 + i])
              ? decodedData[4 + i].toString()
              : decodedData[4 + i],
          }),
          {}
        )
      : {};

    return { ...defaultReturn, ...extraData };
  }

  async addTx(tx: BatchCallInputData) {
    const data = await getBatchCallData(this.web3, this.FactoryProxy, this.factoryProxyAddress, tx);
    this.calls = [...this.calls, data];
    return this.calls;
  }

  async addMultipleTx(txs: BatchCallInputData[]) {
    const data = await Promise.all(
      txs.map((tx, i) => getBatchCallData(this.web3, this.FactoryProxy, this.factoryProxyAddress, tx))
    );
    this.calls = [...this.calls, ...data];
    return data;
  }
}
