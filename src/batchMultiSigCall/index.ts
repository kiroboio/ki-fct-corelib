import { ethers, utils } from "ethers";
import { TypedData, TypedDataUtils } from "ethers-eip712";
import FactoryProxyABI from "../abi/factoryProxy_.abi.json";
import { Params } from "../interfaces";
import { MSCallInput, MSCall, MSCallOptions } from "./interfaces";
import { getTypedDataDomain, createValidatorTxData, manageCallFlagsV2, flows } from "../helpers";
import {
  getSessionId,
  handleData,
  handleEnsHash,
  handleFunctionSignature,
  handleMethodInterface,
  handleTypes,
} from "./helpers";

// DefaultFlag - "f100" // payment + eip712
// const defaultFlags = {
//   eip712: true,
//   payment: true,
//   flow: false,
// };

const variableBase = "0xFC00000000000000000000000000000000000000";
const FDBase = "0xFD00000000000000000000000000000000000000";
const FDBaseBytes = "0xFD00000000000000000000000000000000000000000000000000000000000000";

export class BatchMultiSigCall {
  private FactoryProxy: ethers.Contract;

  options: MSCallOptions = {};

  variables: string[][] = [];
  inputCalls: MSCallInput[] = [];

  constructor(provider: ethers.providers.JsonRpcProvider, contractAddress: string) {
    this.FactoryProxy = new ethers.Contract(contractAddress, FactoryProxyABI, provider);
  }

  // Variables

  public createVariable(variableId: string, value?: string): string[] {
    this.variables = [...this.variables, [variableId, value ?? undefined]];
    return this.variables.map((item) => item[0]);
  }

  private getVariableIndex(variableId: string, throwError: boolean = true): number {
    const index = this.variables.findIndex((item) => item[0] === variableId);
    if (index === -1 && throwError) {
      throw new Error(`Variable ${variableId} doesn't exist`);
    }
    return index;
  }

  private getVariableFCValue(variableId: string): string {
    const index = this.getVariableIndex(variableId);
    return String(index + 1).padStart(variableBase.length, variableBase);
  }

  public getCallValue(index: number, bytes: boolean = false) {
    return (index + 1).toString(16).padStart(bytes ? FDBaseBytes.length : FDBase.length, bytes ? FDBaseBytes : FDBase);
  }

  // End of variables
  //
  //
  // Options

  public setOptions(options: MSCallOptions): MSCallOptions {
    this.options = options;
    return this.options;
  }

  // End of options
  //
  //
  // FCT functions

  public addCall(tx: MSCallInput, index?: number): MSCallInput[] | Error {
    if (index) {
      const length = this.inputCalls.length;
      if (index > length) {
        throw new Error(`Index ${index} is out of bounds.`);
      }
      this.inputCalls.splice(index, 0, tx);
    } else {
      this.inputCalls.push(tx);
    }

    return this.inputCalls;
  }

  public replaceCall(tx: MSCallInput, index: number): MSCallInput[] {
    if (index >= this.inputCalls.length) {
      throw new Error(`Index ${index} is out of bounds.`);
    }
    this.inputCalls[index] = tx;
    return this.inputCalls;
  }

  public removeCall(index: number): MSCallInput[] {
    if (index >= this.inputCalls.length) {
      throw new Error(`Index ${index} is out of bounds.`);
    }
    this.inputCalls.splice(index, 1);
    return this.inputCalls;
  }

  public getCall(index: number): MSCallInput {
    return this.inputCalls[index];
  }

  get length(): number {
    return this.inputCalls.length;
  }

  public async getFCT(): Promise<{
    typedData: TypedData;
    typeHash: string;
    sessionId: string;
    name: string;
    mcall: MSCall[];
  }> {
    let typedHashes: string[] = [];
    let additionalTypes = {};

    const salt: string = [...Array(6)].map(() => Math.floor(Math.random() * 16).toString(16)).join("");
    const version: string = "0x010101";

    const typedData: TypedData = await this.createTypedData(additionalTypes, typedHashes, salt, version);
    const sessionId: string = getSessionId(salt, this.options);

    const mcall: MSCall[] = this.inputCalls.map((call, index) => ({
      typeHash: ethers.utils.hexlify(
        TypedDataUtils.typeHash(typedData.types, typedData.types.BatchMultiSigCall[index + 1].type)
      ),
      functionSignature: handleFunctionSignature(call),
      value: call.value,
      from: utils.isAddress(call.from) ? call.from : this.getVariableFCValue(call.from),
      gasLimit: call.gasLimit ?? 0,
      flags: manageCallFlagsV2(call.flow || "OK_CONT_FAIL_REVERT", call.jump || 0),
      to: this.handleTo(call),
      ensHash: handleEnsHash(call),
      data: handleData(call),
      types: handleTypes(call),
      typedHashes: typedHashes
        ? typedHashes.map((hash) => ethers.utils.hexlify(TypedDataUtils.typeHash(typedData.types, hash)))
        : [],
    }));

    return {
      typedData,
      typeHash: ethers.utils.hexlify(TypedDataUtils.typeHash(typedData.types, typedData.primaryType)),
      sessionId,
      name: this.options.name || "BatchMultiSigCall transaction",
      mcall,
    };
  }

  // End of main FCT functions
  //
  //
  // Helpers functions

  private async createTypedData(
    additionalTypes: object,
    typedHashes: string[],
    salt: string,
    version: string
  ): Promise<TypedData> {
    // Creates messages from multiCalls array for EIP712 sign
    const typedDataMessage = this.inputCalls.reduce((acc: object, call: MSCallInput, index: number) => {
      // Update params if variables (FC) or references (FD) are used
      let paramsData = {};
      if (call.params) {
        this.verifyParams(call.params, index, additionalTypes, typedHashes);
        paramsData = { params: this.getParams(call) };
      }

      return {
        ...acc,
        [`transaction${index + 1}`]: {
          call: {
            from: utils.isAddress(call.from) ? call.from : this.getVariableFCValue(call.from),
            to: this.handleTo(call),
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
    let primaryType = [];

    if ("recurrency" in this.options) {
      optionalMessage = {
        recurrency: {
          max_repeats: this.options.recurrency.maxRepeats,
          chill_time: this.options.recurrency.chillTime,
          accumetable: this.options.recurrency.accumetable,
        },
      };
      optionalTypes = {
        Recurrency: [
          { name: "max_repeats", type: "uint16" },
          { name: "chill_time", type: "uint32" },
          { name: "accumetable", type: "bool" },
        ],
      };
      primaryType = [{ name: "recurrency", type: "Recurrency" }];
    }

    if ("multisig" in this.options) {
      optionalMessage = {
        ...optionalMessage,
        multisig: {
          external_signers: this.options.multisig.externalSigners,
          minimum_approvals: this.options.multisig.minimumApprovals,
        },
      };
      optionalTypes = {
        ...optionalTypes,
        Multisig: [
          { name: "external_signers", type: "address[]" },
          { name: "minimum_approvals", type: "uint8" },
        ],
      };
      primaryType = [...primaryType, { name: "multisig", type: "Multisig" }];
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
          ...this.inputCalls.map((_, index) => ({
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
        ...this.inputCalls.reduce(
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
      domain: await getTypedDataDomain(this.FactoryProxy),
      message: {
        info: {
          name: this.options.name || "BatchMultiSigCall transaction",
          version,
          random_id: `0x${salt}`,
          eip712: true,
        },
        limits: {
          valid_from: this.options.validFrom ?? 0,
          expires_at: this.options.expiresAt ?? 0,
          gas_price_limit: this.options.maxGasPrice ?? "25000000000", // 25 Gwei
          cancelable: this.options.cancelable || true,
        },
        ...optionalMessage,
        ...typedDataMessage,
      },
    };
    return typedData;
  }

  private getParams(call: MSCallInput) {
    // If call has parameters
    if (call.params) {
      // If mcall is a validation call
      if (call.validator) {
        Object.entries(call.validator.params).forEach(([key, value]) => {
          const index = this.getVariableIndex(value, false);
          if (index !== -1) {
            call.validator.params[key] = this.getVariableFCValue(this.variables[index][0]);
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
                    item2.value = this.getVariableFCValue(item2.variable);
                  }
                  return { ...acc, [item2.name]: item2.value };
                }, {})
              );
            } else {
              // If parameter is a custom type
              const valueArray = param.value as Params[];
              value = valueArray.reduce((acc, item) => {
                if (item.variable) {
                  item.value = this.getVariableFCValue(item.variable);
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
  }

  private async verifyParams(params: Params[], index: number, additionalTypes: object, typedHashes: string[]) {
    params.forEach((param) => {
      if (param.variable) {
        param.value = this.getVariableFCValue(param.variable);
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
  }
  private handleTo = (call: MSCallInput) => {
    // If call is a validator method, return validator address as to address
    if (call.validator) {
      return call.validator.validatorAddress;
    }

    // Check if to is a valid address
    if (utils.isAddress(call.to)) {
      return call.to;
    }

    // Else it is a variable
    return this.getVariableFCValue(call.to);
  };
}
