import { ethers } from "ethers";
import { TypedDataUtils } from "ethers-eip712";
import { defaultAbiCoder } from "ethers/lib/utils";
import Web3 from "web3";
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
  getParamsOffset,
  getParamsLength,
} from "../helpers";
import {
  BatchMultiSigCallInputInterface,
  BatchMultiSigCallInterface,
  DecodeTx,
  MultiSigCallInputInterface,
} from "./interfaces";
// import { BatchMultiSigCallData, BatchMultiSigCallInputData, DecodeTx, MultiSigCallInputData } from "./interfaces";

const contractInteractionDefaults = [
  { name: "details", type: "Transaction_" },
  { name: "method_params_offset", type: "uint256" },
  { name: "method_params_length", type: "uint256" },
];

const getMethodInterface = (call: MultiSigCallInputInterface) => {
  return `${call.method}(${call.params.map((item) => item.type).join(",")})`;
};

const generateTxType = (item: MultiSigCallInputInterface) => {
  return item.params
    ? [...contractInteractionDefaults, ...item.params.map((param) => ({ name: param.name, type: param.type }))]
    : [{ name: "details", type: "Transaction_" }];
};

const getEncodedMethodParamsData = (call: MultiSigCallInputInterface) => {
  return `0x${
    call.method
      ? defaultAbiCoder.encode([getMethodInterface(call)], [call.params.map((item) => item.value)]).slice(2)
      : ""
  }`;
};

// DefaultFlag - "f100" // payment + eip712
const defaultFlags = {
  eip712: true,
  payment: true,
  flow: false,
};

const getMultiSigCallData = async (
  web3: Web3,
  FactoryProxy: Contract,
  factoryProxyAddress: string,
  batchCall: BatchMultiSigCallInputInterface
) => {
  const group = getGroupId(batchCall.groupId);
  const tnonce = getNonce(batchCall.nonce);
  const after = getAfterTimestamp(batchCall.afterTimestamp || 0);
  const before = batchCall.beforeTimestamp
    ? getBeforeTimestamp(false, batchCall.beforeTimestamp)
    : getBeforeTimestamp(true);
  const maxGas = getMaxGas(batchCall.maxGas || 0);
  const maxGasPrice = batchCall.maxGasPrice ? getMaxGasPrice(batchCall.maxGasPrice) : "00000005D21DBA00"; // 25 Gwei
  const batchFlags = { ...defaultFlags, ...batchCall.flags };
  const eip712 = getFlags(batchFlags, false); // not-ordered, payment, eip712

  const getSessionId = () => `0x${group}${tnonce}${after}${before}${maxGas}${maxGasPrice}${eip712}`;

  // Creates messages from multiCalls array for EIP712 sign
  // If multicall has encoded contract data, add method_params_offset, method_params_length and method data variables
  // Else multicall is ETH Transfer - add only details
  const typedDataMessage = batchCall.calls.reduce((acc, item, index) => {
    const additionalTxData = item.params
      ? {
          method_params_offset: getParamsOffset(item.params), //'0x180', // '480', // 13*32
          method_params_length: getParamsLength(getEncodedMethodParamsData(item)),
          ...item.params.reduce(
            (acc, param) => ({
              ...acc,
              [param.name]: param.value,
            }),
            {}
          ),
        }
      : {};

    return {
      ...acc,
      [`transaction_${index + 1}`]: {
        details: {
          signer: item.signer,
          call_address: item.to,
          call_ens: item.toEnsHash || "",
          eth_value: item.value,
          gas_limit: Number.parseInt("0x" + maxGas),
          view_only: item.flags?.viewOnly || false,
          continue_on_fail: item.flags?.onFailContinue || false,
          stop_on_fail: item.flags?.onFailStop || false,
          stop_on_success: item.flags?.onSuccessStop || false,
          revert_on_success: item.flags?.onSuccessRevert || false,
          method_interface: item.method ? getMethodInterface(item) : "",
        },
        ...additionalTxData,
      },
    };
  }, {});

  const typedData = {
    types: {
      EIP712Domain: [
        { name: "name", type: "string" },
        { name: "version", type: "string" },
        { name: "chainId", type: "uint256" },
        { name: "verifyingContract", type: "address" },
        { name: "salt", type: "bytes32" },
      ],
      BatchMultiSigCall_: [
        { name: "limits", type: "Limits_" },
        ...batchCall.calls.map((_, index) => ({
          name: `transaction_${index + 1}`,
          type: `Transaction_${index + 1}`,
        })),
      ],
      Limits_: [
        { name: "nonce", type: "uint64" },
        { name: "refund", type: "bool" },
        { name: "valid_from", type: "uint40" },
        { name: "expires_at", type: "uint40" },
        { name: "gas_price_limit", type: "uint64" },
      ],
      Transaction_: [
        { name: "signer", type: "address" },
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
      ...batchCall.calls.reduce(
        (acc, item, index) => ({
          ...acc,
          [`Transaction_${index + 1}`]: generateTxType(item),
        }),
        {}
      ),
    },
    primaryType: "BatchMultiSigCall_",
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

  const encodedMessage = ethers.utils.hexlify(
    TypedDataUtils.encodeData(typedData, typedData.primaryType, typedData.message)
  );

  const encodedLimits = ethers.utils.hexlify(TypedDataUtils.encodeData(typedData, "Limits_", typedData.message.limits));

  const getEncodedMulticallData = (index: number) => {
    const encodedData = ethers.utils.hexlify(
      TypedDataUtils.encodeData(typedData, `Transaction_${index + 1}`, typedData.message[`transaction_${index + 1}`])
    );

    const encodedDetails = ethers.utils.hexlify(
      TypedDataUtils.encodeData(typedData, `Transaction_`, typedData.message[`transaction_${index + 1}`].details)
    );

    return {
      encodedData,
      encodedDetails,
    };
  };

  return {
    typedData,
    typeHash: TypedDataUtils.typeHash(typedData.types, typedData.primaryType),
    sessionId: getSessionId(),
    encodedMessage,
    encodedLimits,
    unhashedCall: batchCall,
    mcall: batchCall.calls.map((item, index) => ({
      typeHash: TypedDataUtils.typeHash(typedData.types, typedData.types.BatchMultiSigCall_[index + 1].type),
      functionSignature: item.method
        ? web3.utils.sha3(getMethodInterface(item))
        : "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470",
      value: item.value,
      signer: item.signer,
      gasLimit: Number.parseInt("0x" + maxGas),
      flags: item.flags ? manageCallFlags(item.flags) : "0",
      to: item.to,
      ensHash: item.toEnsHash
        ? web3.utils.sha3(item.toEnsHash)
        : "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470",
      data: getEncodedMethodParamsData(item),
      ...getEncodedMulticallData(index),
    })),
  };
};

export class BatchMultiSigCall {
  calls: Array<BatchMultiSigCallInterface>;
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

  decodeLimits(encodedLimits: string) {
    const lim = defaultAbiCoder.decode(["bytes32", "uint64", "bool", "uint40", "uint40", "uint64"], encodedLimits);

    return {
      nonce: lim[1].toHexString(),
      payment: lim[2],
      afterTimestamp: lim[3],
      beforeTimestamp: lim[4],
      maxGasPrice: lim[5].toString(),
    };
  }

  decodeTransactions(txs: DecodeTx[]) {
    return txs.map((tx) => {
      const data =
        tx.params && tx.params.length !== 0
          ? defaultAbiCoder.decode(
              ["bytes32", "bytes32", "uint256", "uint256", ...tx.params.map((item) => item.type)],
              tx.encodedData
            )
          : defaultAbiCoder.decode(["bytes32", "bytes32"], tx.encodedData);

      const details = defaultAbiCoder.decode(
        [
          "bytes32",
          "address",
          "address",
          "bytes32",
          "uint256",
          "uint32",
          "bool",
          "bool",
          "bool",
          "bool",
          "bool",
          "bytes32",
        ],
        tx.encodedDetails
      );

      const defaultReturn = {
        typeHash: data[0],
        txHash: data[1],
        transaction: {
          signer: details[1],
          to: details[2],
          toEnsHash:
            details[3] !== "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470"
              ? details[3]
              : undefined,
          value: details[4].toString(),
          gasLimit: details[5],
          staticCall: details[6],
          continueOnFail: details[7],
          stopOnFail: details[8],
          stopOnSuccess: details[9],
          revertOnSuccess: details[10],
          methodHash:
            details[11] !== "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470"
              ? details[11]
              : undefined,
        },
      };

      const extraData =
        tx.params && tx.params.length !== 0
          ? tx.params.reduce(
              (acc, item, i) => ({
                ...acc,
                [item.name]: ethers.BigNumber.isBigNumber(data[4 + i]) ? data[4 + i].toString() : data[4 + i],
              }),
              {}
            )
          : {};

      return {
        ...defaultReturn,
        ...extraData,
      };
    });
  }

  async addBatchCall(tx: BatchMultiSigCallInputInterface) {
    const data = await getMultiSigCallData(this.web3, this.FactoryProxy, this.factoryProxyAddress, tx);
    this.calls = [...this.calls, data];
    return this.calls;
  }

  async addMultipleBatchCalls(txs: BatchMultiSigCallInputInterface[]) {
    const data = await Promise.all(
      txs.map((tx) => getMultiSigCallData(this.web3, this.FactoryProxy, this.factoryProxyAddress, tx))
    );
    this.calls = [...this.calls, ...data];
    return this.calls;
  }

  async editBatchCall(index: number, tx: BatchMultiSigCallInputInterface) {
    const data = await getMultiSigCallData(this.web3, this.FactoryProxy, this.factoryProxyAddress, tx);

    this.calls[index] = data;

    return this.calls;
  }

  async removeBatchCall(index: number) {
    const restOfCalls = this.calls
      .slice(index + 1)
      .map((call) => ({ ...call.unhashedCall, nonce: call.unhashedCall.nonce - 1 }));

    // Remove from calls
    this.calls.splice(index, 1);

    // Adjust nonce number for the rest of the calls
    const data = await Promise.all(
      restOfCalls.map((tx) => getMultiSigCallData(this.web3, this.FactoryProxy, this.factoryProxyAddress, tx))
    );

    this.calls.splice(-Math.abs(data.length), data.length, ...data);

    return this.calls;
  }

  async editMultiCallTx(indexOfBatch: number, indexOfMulticall: number, tx: MultiSigCallInputInterface) {
    const batch = this.calls[indexOfBatch].unhashedCall;
    if (!batch) {
      throw new Error(`Batch doesn't exist on index ${indexOfBatch}`);
    }
    batch.calls[indexOfMulticall] = tx;

    const data = await getMultiSigCallData(this.web3, this.FactoryProxy, this.factoryProxyAddress, batch);

    this.calls[indexOfBatch] = data;

    return this.calls;
  }

  async removeMultiCallTx(indexOfBatch: number, indexOfMulticall: number) {
    const batch = this.calls[indexOfBatch].unhashedCall;

    if (!batch) {
      throw new Error(`Batch doesn't exist on index ${indexOfBatch}`);
    }

    batch.calls.splice(indexOfMulticall, 1);

    const data = await getMultiSigCallData(this.web3, this.FactoryProxy, this.factoryProxyAddress, batch);

    this.calls[indexOfBatch] = data;

    return this.calls;
  }
}
