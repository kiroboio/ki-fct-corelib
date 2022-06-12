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
} from "../helpers";
import { BatchMultiCallData, BatchMultiCallInputData, DecodeTx, MultiCallInputData } from "./interfaces";

const contractInteractionDefaults = [
  { name: "details", type: "Transaction_" },
  { name: "method_params_offset", type: "uint256" },
  { name: "method_params_length", type: "uint256" },
];

const getMethodInterface = (call: MultiCallInputData) => {
  return `${call.method}(${call.params.map((item) => item.type).join(",")})`;
};

const generateTxType = (item: MultiCallInputData) => {
  return item.params
    ? [...contractInteractionDefaults, ...item.params.map((param) => ({ name: param.name, type: param.type }))]
    : [{ name: "details", type: "Transaction_" }];
};

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

  // Creates messages from multiCalls array for EIP712 sign
  // If multicall has encoded contract data, add method_params_offset, method_params_length and method data variables
  // Else multicall is ETH Transfer - add only details
  const typedDataMessage = call.multiCalls.reduce((acc, item, index) => {
    const additionalTxData = item.params
      ? {
          method_params_offset: "0x60", //'0x180', // '480', // 13*32
          method_params_length: "0x40",
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
          call_address: item.to,
          call_ens: item.toEnsHash || "",
          eth_value: item.value,
          gas_limit: Number.parseInt("0x" + maxGas),
          view_only: item.flags?.viewOnly || false,
          continue_on_fail: item.flags?.continueOnFail || false,
          stop_on_fail: item.flags?.stopOnFail || false,
          stop_on_success: item.flags?.stopOnSuccess || false,
          revert_on_success: item.flags?.revertOnSuccess || false,
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
      BatchMultiCall_: [
        { name: "limits", type: "Limits_" },
        ...call.multiCalls.map((_, index) => ({ name: `transaction_${index + 1}`, type: `Transaction_${index + 1}` })),
      ],
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
      ...call.multiCalls.reduce(
        (acc, item, index) => ({
          ...acc,
          [`Transaction_${index + 1}`]: generateTxType(item),
        }),
        {}
      ),
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

  const encodedMessage = ethers.utils.hexlify(
    TypedDataUtils.encodeData(typedData, typedData.primaryType, typedData.message)
  );

  const encodedLimits = ethers.utils.hexlify(TypedDataUtils.encodeData(typedData, "Limits_", typedData.message.limits));

  const getHashedMulticallData = (index) => {
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

  const getEncodedMethodParamsData = (call: MultiCallInputData) => {
    return `0x${
      call.method
        ? defaultAbiCoder.encode([getMethodInterface(call)], [call.params.map((item) => item.value)]).slice(2)
        : ""
    }`;
  };

  return {
    typeHash: TypedDataUtils.typeHash(typedData.types, typedData.primaryType),
    sessionId: getSessionId(),
    signer: call.signer,
    typedData,
    encodedMessage,
    encodedLimits,
    unhashedCall: call,
    mcall: call.multiCalls.map((item, index) => ({
      value: item.value,
      to: item.to,
      data: getEncodedMethodParamsData(item),
      ensHash: item.toEnsHash
        ? web3.utils.sha3(item.toEnsHash)
        : "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470",
      typeHash: TypedDataUtils.typeHash(typedData.types, typedData.types.BatchMultiCall_[index + 1].type),
      flags: item.flags ? manageCallFlags(item.flags) : "0",
      functionSignature: item.method
        ? web3.utils.sha3(getMethodInterface(item))
        : "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470",
      gasLimit: Number.parseInt("0x" + maxGas),
      ...getHashedMulticallData(index),
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
        ["bytes32", "address", "bytes32", "uint256", "uint32", "bool", "bool", "bool", "bool", "bool", "bytes32"],
        tx.encodedDetails
      );

      const defaultReturn = {
        typeHash: data[0],
        txHash: data[1],
        transaction: {
          to: details[1],
          toEnsHash:
            details[2] !== "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470"
              ? details[2]
              : undefined,
          value: details[3].toString(),
          gasLimit: details[4],
          staticCall: details[5],
          continueOnFail: details[6],
          stopOnFail: details[7],
          stopOnSuccess: details[8],
          revertOnSuccess: details[9],
          methodHash:
            details[10] !== "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470"
              ? details[10]
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

  async editTx(index: number, tx: BatchMultiCallInputData) {
    const data = await getBatchTransferData(this.web3, this.FactoryProxy, this.factoryProxyAddress, tx);

    this.calls[index] = data;

    return this.calls;
  }

  async removeTx(index: number) {
    const restOfCalls = this.calls
      .slice(index + 1)
      .map((call) => ({ ...call.unhashedCall, nonce: call.unhashedCall.nonce - 1 }));

    // Remove from calls
    this.calls.splice(index, 1);

    // Adjust nonce number for the rest of the calls
    const data = await Promise.all(
      restOfCalls.map((tx) => getBatchTransferData(this.web3, this.FactoryProxy, this.factoryProxyAddress, tx))
    );

    this.calls.splice(-Math.abs(data.length), data.length, ...data);

    return this.calls;
  }
}
