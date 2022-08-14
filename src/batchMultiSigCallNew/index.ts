import { ethers, utils } from "ethers";
import { TypedDataUtils } from "ethers-eip712";
import { defaultAbiCoder } from "ethers/lib/utils";
import FactoryProxyABI from "../abi/factoryProxy_.abi.json";
import { DecodeTx, Params } from "../interfaces";
import { BatchMultiSigCallInputInterface, BatchMultiSigCallInterface, MultiSigCallInputInterface } from "./interfaces";
import { getTypedDataDomain, createValidatorTxData, manageCallFlagsV2, flows } from "../helpers";
import {
  handleData,
  handleEnsHash,
  handleFunctionSignature,
  handleMethodInterface,
  handleTo,
  handleTypedHashes,
  handleTypes,
} from "./helpers";

const variableBase = "0xFC00000000000000000000000000000000000000";
const FDBase = "0xFD00000000000000000000000000000000000000";
const FDBaseBytes = "0xFD00000000000000000000000000000000000000000000000000000000000000";

// DefaultFlag - "f100" // payment + eip712
const defaultFlags = {
  eip712: true,
  payment: true,
  flow: false,
};

export class BatchMultiSigCallNew {
  calls: Array<BatchMultiSigCallInterface> = [];
  variables: Array<Array<string>> = [];
  provider: ethers.providers.JsonRpcProvider;
  FactoryProxy: ethers.Contract;
  factoryProxyAddress: string;

  constructor(provider: ethers.providers.JsonRpcProvider, contractAddress: string) {
    // this.web3 = web3;
    this.provider = provider;
    this.FactoryProxy = new ethers.Contract(contractAddress, FactoryProxyABI, provider);
  }

  //
  // Everything for variables
  //
  public createVariable(variableId: string, value?: string) {
    this.variables = [...this.variables, [variableId, value ?? undefined]];
    return this.variables.map((item) => item[0]);
  }

  public addVariableValue(variableId: string, value: string) {
    const index = this.getVariableIndex(variableId);
    this.variables[index][1] = value;
    return this.variables.map((item) => item[0]);
  }

  public async removeVariable(variableId: string) {
    // Remove from variables
    this.variables = this.variables.filter((item) => item[0] !== variableId);

    // Adjust all calls to account for removed variable
    const allCalls = this.calls.map((call) => call.inputData);
    const data = await Promise.all(allCalls.map((tx) => this.getMultiSigCallData(tx)));

    this.calls = data;

    return this.variables.map((item) => item[0]);
  }

  public getVariablesAsBytes32() {
    return this.variables.map((item) => {
      const value = item[1];
      if (value === undefined) {
        throw new Error(`Variable ${item[0]} doesn't have a value`);
      }

      if (isNaN(Number(value)) || utils.isAddress(value)) {
        return `0x${String(value).padStart(64, "0")}`;
      }

      return `0x${Number(value).toString(16).padStart(64, "0")}`;
    });
  }

  public getVariableIndex(variableId: string, throwError: boolean = true) {
    const index = this.variables.findIndex((item) => item[0] === variableId);
    if (index === -1 && throwError) {
      throw new Error(`Variable ${variableId} doesn't exist`);
    }
    return index;
  }

  public getVariableFCValue(variableId: string) {
    const index = this.getVariableIndex(variableId);
    return String(index + 1).padStart(variableBase.length, variableBase);
  }
  //
  // End of everything for variables
  //

  //
  // Handle FD
  //

  public refTxValue(index: number, bytes: boolean = false) {
    return (index + 1).toString(16).padStart(bytes ? FDBaseBytes.length : FDBase.length, bytes ? FDBaseBytes : FDBase);
  }

  addExistingBatchCall(batchCall: BatchMultiSigCallInterface) {
    this.calls = [...this.calls, batchCall];
    return this.calls;
  }

  public async create(tx: BatchMultiSigCallInputInterface) {
    const data = await this.getMultiSigCallData(tx);
    this.calls = [...this.calls, data];
    return data;
  }

  public async createMultiple(txs: BatchMultiSigCallInputInterface[]) {
    const data = await Promise.all(txs.map((tx) => this.getMultiSigCallData(tx)));
    this.calls = [...this.calls, ...data];
    return data;
  }

  public async editBatchCall(index: number, tx: BatchMultiSigCallInputInterface) {
    const data = await this.getMultiSigCallData(tx);

    this.calls[index] = data;

    return data;
  }

  public async removeBatchCall(index: number) {
    const restOfCalls = this.calls.slice(index + 1).map((call) => ({ ...call.inputData }));

    // Remove from calls
    this.calls.splice(index, 1);

    // Adjust nonce number for the rest of the calls
    const data = await Promise.all(restOfCalls.map((tx) => this.getMultiSigCallData(tx)));

    this.calls.splice(-Math.abs(data.length), data.length, ...data);

    return this.calls;
  }

  public async addMultiCallTx(indexOfBatch: number, tx: MultiSigCallInputInterface) {
    const batch = this.calls[indexOfBatch].inputData;
    if (!batch) {
      throw new Error(`Batch doesn't exist on index ${indexOfBatch}`);
    }
    batch.calls.push(tx);
    const data = await this.getMultiSigCallData(batch);
    this.calls[indexOfBatch] = data;

    return data;
  }

  public async editMultiCallTx(indexOfBatch: number, indexOfMulticall: number, tx: MultiSigCallInputInterface) {
    const batch = this.calls[indexOfBatch].inputData;
    if (!batch) {
      throw new Error(`Batch doesn't exist on index ${indexOfBatch}`);
    }
    batch.calls[indexOfMulticall] = tx;

    const data = await this.getMultiSigCallData(batch);

    this.calls[indexOfBatch] = data;

    return data;
  }

  public async removeMultiCallTx(indexOfBatch: number, indexOfMulticall: number) {
    const batch = this.calls[indexOfBatch].inputData;

    if (!batch) {
      throw new Error(`Batch doesn't exist on index ${indexOfBatch}`);
    }

    batch.calls.splice(indexOfMulticall, 1);

    const data = await this.getMultiSigCallData(batch);

    this.calls[indexOfBatch] = data;

    return data;
  }

  private async getMultiSigCallData(batchCall: BatchMultiSigCallInputInterface): Promise<BatchMultiSigCallInterface> {
    const self = this;
    const sessionId = "0x00000100000000010000000000ffffffffff0000000000000005D21DBA00f100";

    let typedHashes = [];
    let additionalTypes = {};

    const typedData = await createTypedData(self, batchCall, additionalTypes, typedHashes);

    const mcall = batchCall.calls.map((call, index) => ({
      typeHash: ethers.utils.hexlify(
        TypedDataUtils.typeHash(typedData.types, typedData.types.BatchMultiSigCall[index + 1].type)
      ),
      functionSignature: handleFunctionSignature(call),
      value: call.value,
      from: utils.isAddress(call.from) ? call.from : this.getVariableFCValue(call.from),
      gasLimit: call.gasLimit ?? 0,
      flags: manageCallFlagsV2(call.flow || "OK_CONT_FAIL_REVERT", call.jump || 0),
      to: handleTo(self, call),
      ensHash: handleEnsHash(call),
      data: handleData(call),
      types: handleTypes(call),
      typedHashes: handleTypedHashes(call, typedData),
      // ...getEncodedMulticallData(typedData, index),
    }));

    return {
      typedData,
      typeHash: ethers.utils.hexlify(TypedDataUtils.typeHash(typedData.types, typedData.primaryType)),
      sessionId,
      inputData: batchCall,
      mcall,

      addCall: async function (tx: MultiSigCallInputInterface, index?: number) {
        if (index) {
          const length = this.inputData.calls.length;
          if (index > length) {
            throw new Error(`Index ${index} is out of bounds.`);
          }
          this.inputData.calls.splice(index, 0, tx);
        } else {
          this.inputData.calls.push(tx);
        }
        const data = await self.getMultiSigCallData(this.inputData);
        this.typedData = data.typedData;
        this.typeHash = data.typeHash;
        this.sessionId = data.sessionId;
        this.mcall = data.mcall;

        return data;
      },
      replaceCall: async function (tx: MultiSigCallInputInterface, index: number) {
        if (index >= this.inputData.calls.length) {
          throw new Error(`Index ${index} is out of bounds.`);
        }
        const prevCall = this.inputData.calls[index];

        this.inputData.calls[index] = tx;
        const data = await self.getMultiSigCallData(this.inputData);

        this.typedData = data.typedData;
        this.typeHash = data.typeHash;
        this.sessionId = data.sessionId;
        this.mcall = data.mcall;

        return prevCall;
      },
      removeCall: async function (index: number) {
        if (index >= this.inputData.calls.length) {
          throw new Error(`Index ${index} is out of bounds.`);
        }

        const prevCall = this.inputData.calls[index];

        this.inputData.calls.splice(index, 1);
        const data = await self.getMultiSigCallData(this.inputData);

        this.typedData = data.typedData;
        this.typeHash = data.typeHash;
        this.sessionId = data.sessionId;
        this.mcall = data.mcall;

        return prevCall;
      },
      getCall: function (index: number) {
        return this.mcall[index];
      },
      get length() {
        return this.mcall.length;
      },
    };
  }

  public decodeLimits(encodedLimits: string) {
    const lim = defaultAbiCoder.decode(["bytes32", "uint64", "bool", "uint40", "uint40", "uint64"], encodedLimits);

    return {
      nonce: lim[1].toHexString(),
      payment: lim[2],
      afterTimestamp: lim[3],
      beforeTimestamp: lim[4],
      maxGasPrice: lim[5].toString(),
    };
  }

  public decodeTransactions(txs: DecodeTx[]) {
    return txs.map((tx) => {
      const data =
        tx.params && tx.params.length !== 0
          ? defaultAbiCoder.decode(["bytes32", "bytes32", ...tx.params.map((item) => item.type)], tx.encodedMessage)
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
                [item.name]: ethers.BigNumber.isBigNumber(data[2 + i]) ? data[2 + i].toString() : data[2 + i],
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

const verifyParams = (
  self: BatchMultiSigCallNew,
  params: Params[],
  index: number,
  additionalTypes: object,
  typedHashes: string[]
) => {
  params.forEach((param) => {
    if (param.variable) {
      param.value = self.getVariableFCValue(param.variable);
      return;
    }
    // If parameter value is FD (reference value to previous tx)
    if (typeof param.value === "string" && param.value.includes("0xFD")) {
      const refIndex = parseInt(param.value.substring(param.value.length - 3), 16) - 1;
      // Checks if current transaction doesn't reference current or future transaction
      if (refIndex >= index) {
        throw new Error(
          `Parameter ${param.name} references a future or current call, referencing call at position ${refIndex})`
        );
      }
      return;
    }
    if (param.customType) {
      if (additionalTypes[param.type]) {
        return;
      }
      if (param.type.lastIndexOf("[") > 0) {
        const type = param.type.slice(0, param.type.lastIndexOf("["));
        typedHashes.push(type);
        const arrayValue = param.value[0] as Params[];
        additionalTypes[type] = arrayValue.reduce((acc, item) => {
          return [...acc, { name: item.name, type: item.type }];
        }, []);
      } else {
        const type = param.type;
        typedHashes.push(type);
        const arrayValue = param.value as Params[];
        additionalTypes[type] = arrayValue.reduce((acc, item) => {
          return [...acc, { name: item.name, type: item.type }];
        }, []);
      }
    }
  });
};

const getParams = (self: BatchMultiSigCallNew, call: MultiSigCallInputInterface) => {
  // If call has parameters
  if (call.params) {
    // If mcall is a validation call
    if (call.validator) {
      Object.entries(call.validator.params).forEach(([key, value]) => {
        const index = self.getVariableIndex(value, false);
        if (index !== -1) {
          call.validator.params[key] = self.getVariableFCValue(self.variables[index][0]);
        }
      });

      return createValidatorTxData(call);
    }

    return {
      ...call.params.reduce((acc, param) => {
        let value;

        // If parameter is a custom type (struct)
        if (param.customType) {
          // If parameter is an array of custom types
          if (param.type.lastIndexOf("[") > 0) {
            const valueArray = param.value as Params[][];
            value = valueArray.map((item) =>
              item.reduce((acc, item2) => {
                if (item2.variable) {
                  item2.value = self.getVariableFCValue(item2.variable);
                }
                return { ...acc, [item2.name]: item2.value };
              }, {})
            );
          } else {
            // If parameter is a custom type
            const valueArray = param.value as Params[];
            value = valueArray.reduce((acc, item) => {
              if (item.variable) {
                item.value = self.getVariableFCValue(item.variable);
              }
              return { ...acc, [item.name]: item.value };
            }, {});
          }
        } else {
          // If parameter isn't a struct/custom type
          value = param.value;
        }
        return {
          ...acc,
          [param.name]: value,
        };
      }, {}),
    };
  }
  return {};
};

const createTypedData = async (
  self: BatchMultiSigCallNew,
  batchCall: BatchMultiSigCallInputInterface,
  additionalTypes: object,
  typedHashes: string[]
) => {
  const callDetails = "0x00000100000000010000000000ffffffffff0000000000000005D21DBA00f100";

  // Creates messages from multiCalls array for EIP712 sign
  const typedDataMessage = batchCall.calls.reduce((acc: object, call: MultiSigCallInputInterface, index: number) => {
    // Update params if variables (FC) or references (FD) are used
    let paramsData = {};
    if (call.params) {
      verifyParams(self, call.params, index, additionalTypes, typedHashes);
      paramsData = { params: getParams(self, call) };
    }

    return {
      ...acc,
      [`transaction${index + 1}`]: {
        call: {
          from: utils.isAddress(call.from) ? call.from : self.getVariableFCValue(call.from),
          to: handleTo(self, call),
          to_ens: call.toEnsHash || "",
          eth_value: call.value,
          gas_limit: call.gasLimit || 0,
          view_only: call.viewOnly || false,
          flow_control: call.flow ? flows[call.flow].text : "continue on success, revert on fail",
          jump_over: call.jump || 0,
          method_interface: handleMethodInterface(call),
        },
        ...paramsData,
      },
    };
  }, {});

  let optionalMessage = {};
  let optionalTypes = {};

  if (batchCall.recurrency) {
    optionalMessage = {
      recurrency: {
        max_repeats: batchCall.recurrency.maxRepeats,
        chill_time: batchCall.recurrency.chillTime,
        accumetable: batchCall.recurrency.accumetable,
      },
    };
    optionalTypes = {
      Recurrency: [
        { name: "max_repeats", type: "uint16" },
        { name: "chill_time", type: "uint32" },
        { name: "accumetable", type: "bool" },
      ],
    };
  }

  if (batchCall.multisig) {
    optionalMessage = {
      ...optionalMessage,
      multisig: {
        external_signers: batchCall.multisig.externalSigners,
        minimum_approvals: batchCall.multisig.minimumApprovals,
      },
    };
    optionalTypes = {
      ...optionalTypes,
      Multisig: [
        { name: "external_signers", type: "address[]" },
        { name: "minimum_approvals", type: "uint8" },
      ],
    };
  }

  const typedData = {
    types: {
      EIP712Domain: [
        { name: "name", type: "string" },
        { name: "version", type: "string" },
        { name: "chainId", type: "uint256" },
        { name: "verifyingContract", type: "address" },
        { name: "salt", type: "bytes32" },
      ],
      BatchMultiSigCall: [
        { name: "info", type: "Info" },
        { name: "limits", type: "Limits" },
        { name: "recurrency", type: "Recurrency" },
        { name: "multisig", type: "Multisig" },
        ...batchCall.calls.map((_, index) => ({
          name: `transaction${index + 1}`,
          type: `Transaction${index + 1}`,
        })),
      ],
      Info: [
        { name: "name", type: "string" },
        { name: "version", type: "bytes3" },
        { name: "eip712", type: "bool" },
        { name: "random_id", type: "bytes3" },
      ],
      Limits: [
        { name: "valid_from", type: "uint40" },
        { name: "expires_at", type: "uint40" },
        { name: "gas_price_limit", type: "uint64" },
        { name: "cancelable", type: "bool" },
      ],
      ...optionalTypes,
      Transaction: [
        { name: "from", type: "address" },
        { name: "to", type: "address" },
        { name: "to_ens", type: "string" },
        { name: "eth_value", type: "uint256" },
        { name: "gas_limit", type: "uint32" },
        { name: "view_only", type: "bool" },
        { name: "flow_control", type: "string" },
        { name: "jump_over", type: "uint8" },
        { name: "method_interface", type: "string" },
      ],
      ...batchCall.calls.reduce(
        (acc: object, call, index: number) => ({
          ...acc,
          [`Transaction${index + 1}`]: [
            { name: "call", type: "Transaction" },
            { name: "params", type: `Transaction${index + 1}_Params` },
          ],
          [`Transaction${index + 1}_Params`]: call.params.map((param) => ({ name: param.name, type: param.type })),
        }),
        {}
      ),
      ...additionalTypes,
    },
    primaryType: "BatchMultiSigCall",
    domain: await getTypedDataDomain(self.FactoryProxy),
    message: {
      info: {
        name: batchCall.name || "BatchMultiSigCall transaction",
        version: 0x010101,
        random_id: 0x2395b1,
        eip712: true,
      },
      limits: {
        valid_from: batchCall.validFrom ?? 0,
        expires_at: batchCall.expiresAt ?? 0,
        gas_price_limit: batchCall.gasPriceLimit ?? 0,
        cancelable: batchCall.cancelable || true,
      },
      ...optionalMessage,
      ...typedDataMessage,
    },
  };
  return typedData;
};
