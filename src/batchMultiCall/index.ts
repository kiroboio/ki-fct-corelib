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
  manageCallFlags,
  getFlags,
} from "../helpers";

interface MultiCallFlags {
  viewOnly: boolean;
  continueOnFail: boolean;
  stopOnFail: boolean;
  stopOnSuccess: boolean;
  revertOnSuccess: boolean;
}

interface BatchFlags {
  staticCall?: boolean;
  cancelable?: boolean;
  payment?: boolean;
}

interface MultiCallInputData {
  value: string;
  to: string;

  data?: string;
  methodInterface?: string;
  methodData?: Object;

  toEnsHash?: string;

  afterTimestamp?: number;
  beforeTimestamp?: number;
  maxGas?: number;
  maxGasPrice?: number;

  flags?: MultiCallFlags;
}
interface BatchMultiCallInputData {
  groupId: number;
  nonce: number;
  signer: string;
  signerPrivateKey?: string;
  afterTimestamp?: number;
  beforeTimestamp?: number;
  maxGas?: number;
  maxGasPrice?: number;
  flags?: BatchFlags;
  multiCalls: MultiCallInputData[];
}

interface MultiCall {
  value: string;
  to: string;
  data: string;
  ensHash: string;
  typeHash: Uint8Array;
  flags: string;
  functionSignature: string;
  gasLimit: number;
}

interface BatchMultiCallData {
  r: string;
  s: string;
  typeHash: Uint8Array;
  sessionId: string;
  signer: string;
  v: string;
  mcall: MultiCall[];
}

const contractInteractionDefaults = [
  { name: "details", type: "Transaction_" },
  { name: "method_params_offset", type: "uint256" },
  { name: "method_params_length", type: "uint256" },
];

const generateTxType = (item: MultiCallInputData) => {
  return item.methodData
    ? [
        ...contractInteractionDefaults,
        ...Object.entries(item.methodData).map(([key, value]) => ({ name: key, type: value[0] })),
      ]
    : [{ name: "details", type: "Transaction_" }];
};

function arraysEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length !== b.length) return false;

  for (var i = 0; i < a.length; ++i) {
    if (JSON.stringify(a[1]) !== JSON.stringify(b[1])) return false;
  }
  return true;
}

// DefaultFlag - "f100" // payment + eip712
const defaultFlags = {
  eip712: true,
  payment: true,
  flow: false,
};

const getBatchTransferData = async (
  web3: Web3,
  FactoryProxy: Contract,
  factoryProxyAddress: string,
  call: BatchMultiCallInputData
) => {
  const group = getGroupId(call.groupId);
  const tnonce = getNonce(call.nonce);
  const after = getAfterTimestamp(call.afterTimestamp || 0);
  const before = call.beforeTimestamp ? getBeforeTimestamp(false, call.beforeTimestamp) : getBeforeTimestamp(true);
  const maxGas = getMaxGas(call.maxGas || 0);
  const maxGasPrice = call.maxGasPrice ? getMaxGasPrice(call.maxGasPrice) : "00000005D21DBA00"; // 25 Gwei
  const batchFlags = { ...defaultFlags, ...call.flags };
  const eip712 = getFlags(batchFlags, false); // not-ordered, payment, eip712

  const getSessionId = () => `0x${group}${tnonce}${after}${before}${maxGas}${maxGasPrice}${eip712}`;

  // Creates types and batchMultiCallTypes for EIP712 sign
  const txTypes = call.multiCalls.reduce(
    (acc, item, index) => {
      const txTypeExists = Object.entries(acc.txTypes).some((txType) => arraysEqual(txType[1], generateTxType(item)));

      // If multicall has encoded contract data
      if (item.data) {
        if (txTypeExists) {
          const typeName = Object.keys(acc.txTypes).find((key) => arraysEqual(acc.txTypes[key], generateTxType(item)));
          return {
            batchMulticallTypes: [...acc.batchMulticallTypes, { name: `transaction_${index + 1}`, type: typeName }],
            txTypes: acc.txTypes,
          };
        }
        return {
          batchMulticallTypes: [
            ...acc.batchMulticallTypes,
            { name: `transaction_${index + 1}`, type: `ContractInteraction_${index + 1}` },
          ],
          txTypes: {
            ...acc.txTypes,
            [`ContractInteraction_${index + 1}`]: [
              ...contractInteractionDefaults,
              ...Object.entries(item.methodData).map(([key, value]) => ({ name: key, type: value[0] })),
            ],
          },
        };
      }
      // Else multicall is ETH transfer
      return {
        batchMulticallTypes: [...acc.batchMulticallTypes, { name: `transaction_${index + 1}`, type: "EthTransfer" }],
        txTypes: txTypeExists
          ? acc.txTypes
          : { ...acc.txTypes, EthTransfer: [{ name: "details", type: "Transaction_" }] },
      };
    },
    {
      batchMulticallTypes: [],
      txTypes: {},
    }
  );

  // Creates messages from multiCalls array for EIP712 sign
  // If multicall has encoded contract data, add method_params_offset, method_params_length and method data variables
  // Else multicall is ETH Transfer - add only details
  const typedDataMessage = call.multiCalls.reduce(
    (acc, item, index) => ({
      ...acc,
      [`transaction_${index + 1}`]: item.data
        ? {
            details: {
              call_address: item.to,
              call_ens: item.toEnsHash || "",
              eth_value: item.value,
              gas_limit: Number.parseInt("0x" + maxGas),
              view_only: item.flags?.viewOnly || false,
              continue_on_fail: item.flags?.continueOnFail || false,
              stop_on_fail: item.flags?.stopOnFail || false,
              stop_on_success: item.flags?.stopOnSuccess || false,
              revert_on_success: item.flags?.revertOnSuccess || false,
              method_interface: item.methodInterface || "",
            },
            method_params_offset: "0x60", //'0x180', // '480', // 13*32
            method_params_length: "0x40",
            ...Object.entries(item.methodData).reduce((acc, [key, value]) => {
              return {
                ...acc,
                [key]: value[1],
              };
            }, {}),
          }
        : {
            details: {
              call_address: item.to,
              call_ens: item.toEnsHash || "",
              eth_value: item.value,
              gas_limit: Number.parseInt("0x" + maxGas),
              view_only: item.flags?.viewOnly || false,
              continue_on_fail: item.flags?.continueOnFail || false,
              stop_on_fail: item.flags?.stopOnFail || false,
              stop_on_success: item.flags?.stopOnSuccess || false,
              revert_on_success: item.flags?.revertOnSuccess || false,
              method_interface: "",
            },
          },
    }),
    {}
  );

  const typedData = {
    types: {
      EIP712Domain: [
        { name: "name", type: "string" },
        { name: "version", type: "string" },
        { name: "chainId", type: "uint256" },
        { name: "verifyingContract", type: "address" },
        { name: "salt", type: "bytes32" },
      ],
      BatchMultiCall_: [{ name: "limits", type: "Limits_" }, ...txTypes.batchMulticallTypes],
      Limits_: [
        { name: "nonce", type: "uint64" },
        { name: "refund", type: "bool" },
        { name: "valid_from", type: "uint40" },
        { name: "expires_at", type: "uint40" },
        { name: "gas_price_limit", type: "uint64" },
      ],
      Transaction_: [
        { name: "call_address", type: "address" },
        { name: "call_ens", type: "string" },
        { name: "eth_value", type: "uint256" },
        { name: "gas_limit", type: "uint32" },
        { name: "view_only", type: "bool" },
        { name: "continue_on_fail", type: "bool" },
        { name: "stop_on_fail", type: "bool" },
        { name: "stop_on_success", type: "bool" },
        { name: "revert_on_success", type: "bool" },
        { name: "method_interface", type: "string" },
      ],
      ...txTypes.txTypes,
    },
    primaryType: "BatchMultiCall_",
    domain: {
      name: await FactoryProxy.methods.NAME().call(),
      version: await FactoryProxy.methods.VERSION().call(),
      chainId: Number("0x" + web3.utils.toBN(await FactoryProxy.methods.CHAIN_ID().call()).toString("hex")),
      verifyingContract: factoryProxyAddress,
      salt: await FactoryProxy.methods.uid().call(),
    },
    message: {
      limits: {
        nonce: "0x" + group + tnonce,
        refund: batchFlags.payment,
        valid_from: Number.parseInt("0x" + after),
        expires_at: Number.parseInt("0x" + before),
        gas_price_limit: Number.parseInt("0x" + maxGasPrice),
      },
      ...typedDataMessage,
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
    r: signature.r,
    s: signature.s,
    typeHash: TypedDataUtils.typeHash(typedData.types, typedData.primaryType),
    sessionId: getSessionId(),
    signer: call.signer,
    v: signature.v,
    mcall: call.multiCalls.map((item, index) => ({
      value: item.value,
      to: item.to,
      data: item.data && item.data.length > 0 ? "0x" + item.data.slice(10) : "0x",
      ensHash: item.toEnsHash
        ? web3.utils.sha3(item.toEnsHash)
        : "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470",
      typeHash: TypedDataUtils.typeHash(typedData.types, typedData.types.BatchMultiCall_[index + 1].type),
      flags: item.flags ? manageCallFlags(item.flags) : "0",
      functionSignature: item.methodInterface
        ? web3.utils.sha3(item.methodInterface)
        : "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470",
      gasLimit: Number.parseInt("0x" + maxGas),
    })),
  };
};

export class BatchMultiCall {
  calls: Array<BatchMultiCallData>;
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

  async addBatchCall(tx: BatchMultiCallInputData) {
    const data = await getBatchTransferData(this.web3, this.FactoryProxy, this.factoryProxyAddress, tx);
    this.calls = [...this.calls, data];
    return this.calls;
  }

  async addMultipleBatchCalls(txs: BatchMultiCallInputData[]) {
    const data = await Promise.all(
      txs.map((tx) => getBatchTransferData(this.web3, this.FactoryProxy, this.factoryProxyAddress, tx))
    );
    this.calls = [...this.calls, ...data];
    return this.calls;
  }

  async execute(activator: string, groupId: number) {
    const calls = this.calls;

    if (calls.length === 0) {
      throw new Error("No calls haven't been added");
    }

    return await this.FactoryProxy.methods.batchMultiCall_(calls, groupId).send({ from: activator });
  }
}
