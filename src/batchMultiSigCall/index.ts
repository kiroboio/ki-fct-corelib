import { ethers } from "ethers";
import { TypedDataUtils } from "ethers-eip712";
import { defaultAbiCoder } from "ethers/lib/utils";
import Web3 from "web3";
import Contract from "web3/eth/contract";
import FactoryProxyABI from "../abi/factoryProxy_.abi.json";
import { DecodeTx } from "../interfaces";
import { BatchMultiSigCallInputInterface, BatchMultiSigCallInterface, MultiSigCallInputInterface } from "./interfaces";
import {
  getParamsOffset,
  getParamsLength,
  getSessionIdDetails,
  getTypedDataDomain,
  getEncodedMethodParams,
  getMethodInterface,
  generateTxType,
  createValidatorTxData,
  getValidatorMethodInterface,
  getValidatorData,
  manageCallFlagsV2,
  flows,
} from "../helpers";

const variableBase = "0xFC00000000000000000000000000000000000000";
const FDBase = "0xFD00000000000000000000000000000000000000";

// DefaultFlag - "f100" // payment + eip712
const defaultFlags = {
  eip712: true,
  payment: true,
  flow: false,
};

export class BatchMultiSigCall {
  calls: Array<BatchMultiSigCallInterface> = [];
  variables: Array<Array<string>> = [];
  web3: Web3;
  FactoryProxy: Contract;
  factoryProxyAddress: string;

  constructor(web3: Web3, contractAddress: string) {
    this.web3 = web3;
    // @ts-ignore
    this.FactoryProxy = new web3.eth.Contract(FactoryProxyABI, contractAddress);
    this.factoryProxyAddress = contractAddress;
  }

  createVariable(variableId: string, value?: string) {
    this.variables = [...this.variables, [variableId, value ?? undefined]];
    return this.variables.map((item) => item[0]);
  }

  addVariableValue(variableId: string, value: string) {
    const index = this.getVariableIndex(variableId);
    this.variables[index][1] = value;
    return this.variables.map((item) => item[0]);
  }

  async removeVariable(variableId: string) {
    // Remove from variables
    this.variables = this.variables.filter((item) => item[0] !== variableId);

    // Adjust all calls to account for removed variable
    const allCalls = this.calls.map((call) => call.inputData);
    const data = await Promise.all(allCalls.map((tx) => this.getMultiSigCallData(tx)));

    this.calls = data;

    return this.variables.map((item) => item[0]);
  }

  getVariablesAsBytes32() {
    return this.variables.map((item) => {
      const value = item[1];
      if (value === undefined) {
        throw new Error(`Variable ${item[0]} doesn't have a value`);
      }

      return `0x${this.web3.utils.padLeft(String(value).replace("0x", ""), 64)}`;
    });
  }

  private getVariableIndex(variableId: string) {
    const index = this.variables.findIndex((item) => item[0] === variableId);
    if (index === -1) {
      throw new Error(`Variable ${variableId} doesn't exist`);
    }
    return index;
  }

  private getVariableFCValue(variableId: string) {
    const index = this.getVariableIndex(variableId);
    return String(index + 1).padStart(variableBase.length, variableBase);
  }

  async addBatchCall(tx: BatchMultiSigCallInputInterface) {
    const data = await this.getMultiSigCallData(tx);
    this.calls = [...this.calls, data];
    return data;
  }

  async addMultipleBatchCalls(txs: BatchMultiSigCallInputInterface[]) {
    const data = await Promise.all(txs.map((tx) => this.getMultiSigCallData(tx)));
    this.calls = [...this.calls, ...data];
    return data;
  }

  async editBatchCall(index: number, tx: BatchMultiSigCallInputInterface) {
    const data = await this.getMultiSigCallData(tx);

    this.calls[index] = data;

    return data;
  }

  async removeBatchCall(index: number) {
    const restOfCalls = this.calls
      .slice(index + 1)
      .map((call) => ({ ...call.inputData, nonce: call.inputData.nonce - 1 }));

    // Remove from calls
    this.calls.splice(index, 1);

    // Adjust nonce number for the rest of the calls
    const data = await Promise.all(restOfCalls.map((tx) => this.getMultiSigCallData(tx)));

    this.calls.splice(-Math.abs(data.length), data.length, ...data);

    return this.calls;
  }

  async editMultiCallTx(indexOfBatch: number, indexOfMulticall: number, tx: MultiSigCallInputInterface) {
    const batch = this.calls[indexOfBatch].inputData;
    if (!batch) {
      throw new Error(`Batch doesn't exist on index ${indexOfBatch}`);
    }
    batch.calls[indexOfMulticall] = tx;

    const data = await this.getMultiSigCallData(batch);

    this.calls[indexOfBatch] = data;

    return data;
  }

  async removeMultiCallTx(indexOfBatch: number, indexOfMulticall: number) {
    const batch = this.calls[indexOfBatch].inputData;

    if (!batch) {
      throw new Error(`Batch doesn't exist on index ${indexOfBatch}`);
    }

    batch.calls.splice(indexOfMulticall, 1);

    const data = await this.getMultiSigCallData(batch);

    this.calls[indexOfBatch] = data;

    return data;
  }

  private async getMultiSigCallData(batchCall: BatchMultiSigCallInputInterface) {
    const callDetails = getSessionIdDetails(batchCall, defaultFlags, false);

    // Creates messages from multiCalls array for EIP712 sign
    // If multicall has encoded contract data, add method_params_offset, method_params_length and method data variables
    // Else multicall is ETH Transfer - add only details
    const typedDataMessage = batchCall.calls.reduce((acc, item, index) => {
      const txData = () => {
        if (item.params) {
          if (item.validator) {
            return createValidatorTxData(item);
          }
          item.params.forEach((param) => {
            if (param.variable) {
              param.value = this.getVariableFCValue(param.variable);
              return;
            }
            if (param.valueFromTx) {
              if (index <= param.valueFromTx) {
                throw new Error(`Parameter value should reference one of the previous calls`);
              }
              param.value = String(param.valueFromTx + 1).padStart(FDBase.length, FDBase);
              return;
            }
          });
          return {
            method_params_offset: getParamsOffset(), //'0x180', // '480', // 13*32
            method_params_length: getParamsLength(getEncodedMethodParams(item, false)),
            ...item.params.reduce((acc, param) => {
              return {
                ...acc,
                [param.name]: param.value,
              };
            }, {}),
          };
        }
        return {};
      };

      return {
        ...acc,
        [`transaction_${index + 1}`]: {
          details: {
            signer: this.web3.utils.isAddress(item.signer) ? item.signer : this.getVariableFCValue(item.signer),
            call_address: item.validator
              ? item.validator.validatorAddress
              : this.web3.utils.isAddress(item.to)
              ? item.to
              : this.getVariableFCValue(item.to),
            call_ens: item.toEnsHash || "",
            eth_value: item.value,
            gas_limit: item.gasLimit || Number.parseInt("0x" + callDetails.gasLimit),
            view_only: item.viewOnly || false,
            flow_control: item.flow ? flows[item.flow].text : "continue on success, revert on fail",
            jump_over: item.jump || 0,
            method_interface: item.method
              ? item.validator
                ? getValidatorMethodInterface(item.validator)
                : getMethodInterface(item)
              : "",
          },
          ...txData(),
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
          { name: "flow_control", type: "string" },
          { name: "jump_over", type: "uint8" },
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
      domain: await getTypedDataDomain(this.web3, this.FactoryProxy, this.factoryProxyAddress),
      message: {
        limits: {
          nonce: "0x" + callDetails.group + callDetails.nonce,
          refund: callDetails.pureFlags.payment,
          valid_from: Number.parseInt("0x" + callDetails.after),
          expires_at: Number.parseInt("0x" + callDetails.before),
          gas_price_limit: Number.parseInt("0x" + callDetails.maxGasPrice),
        },
        ...typedDataMessage,
      },
    };

    const encodedMessage = ethers.utils.hexlify(
      TypedDataUtils.encodeData(typedData, typedData.primaryType, typedData.message)
    );

    const encodedLimits = ethers.utils.hexlify(
      TypedDataUtils.encodeData(typedData, "Limits_", typedData.message.limits)
    );

    const getEncodedMulticallData = (index: number) => {
      const encodedMessage = ethers.utils.hexlify(
        TypedDataUtils.encodeData(typedData, `Transaction_${index + 1}`, typedData.message[`transaction_${index + 1}`])
      );

      const encodedDetails = ethers.utils.hexlify(
        TypedDataUtils.encodeData(typedData, `Transaction_`, typedData.message[`transaction_${index + 1}`].details)
      );

      return {
        encodedMessage,
        encodedDetails,
      };
    };

    return {
      typedData,
      typeHash: ethers.utils.hexlify(TypedDataUtils.typeHash(typedData.types, typedData.primaryType)),
      sessionId: callDetails.sessionId,
      encodedMessage,
      encodedLimits,
      inputData: batchCall,
      mcall: batchCall.calls.map((item, index) => ({
        typeHash: ethers.utils.hexlify(
          TypedDataUtils.typeHash(typedData.types, typedData.types.BatchMultiSigCall_[index + 1].type)
        ),
        functionSignature: item.method
          ? this.web3.utils.sha3(
              item.validator ? getValidatorMethodInterface(item.validator) : getMethodInterface(item)
            )
          : "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470",
        value: item.value,
        signer: this.web3.utils.isAddress(item.signer) ? item.signer : this.getVariableFCValue(item.signer),
        gasLimit: item.gasLimit || Number.parseInt("0x" + callDetails.gasLimit),
        flags: manageCallFlagsV2(item.flow || "OK_CONT_FAIL_REVERT", item.jump || 0),
        to: item.validator
          ? item.validator.validatorAddress
          : this.web3.utils.isAddress(item.to)
          ? item.to
          : this.getVariableFCValue(item.to),
        ensHash: item.toEnsHash
          ? this.web3.utils.sha3(item.toEnsHash)
          : "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470",
        data: item.validator ? getValidatorData(item, true) : getEncodedMethodParams(item),
        ...getEncodedMulticallData(index),
      })),
    };
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
              tx.encodedMessage
            )
          : defaultAbiCoder.decode(["bytes32", "bytes32"], tx.encodedMessage);

      const details = defaultAbiCoder.decode(
        ["bytes32", "address", "address", "bytes32", "uint256", "uint32", "bool", "bytes32", "uint8", "bytes32"],
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
          flow: details[7],
          jump: details[8],
          methodHash:
            details[9] !== "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470"
              ? details[9]
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
}
