import { BigNumber, ethers, utils } from "ethers";
import { TypedData, TypedDataUtils } from "ethers-eip712";
import FactoryProxyABI from "../abi/factoryProxy_.abi.json";
import { Params } from "../interfaces";
import { MSCallInput, MSCall, MSCallOptions, IWithPlugin, IBatchMultiSigCallFCT } from "./interfaces";
import {
  getTypedDataDomain,
  createValidatorTxData,
  flows,
  getMethodInterface,
  getValidatorFunctionData,
} from "../helpers";
import {
  getSessionId,
  handleData,
  handleEnsHash,
  handleFunctionSignature,
  handleMethodInterface,
  handleTypes,
  manageCallId,
  parseSessionID,
} from "./helpers";
import { getPlugin, getPlugins, Plugin, PluginInstance } from "@kirobo/ki-eth-fct-provider-ts";
import { AbiCoder, id } from "ethers/lib/utils";
import { Flow } from "../constants";

function getDate(days: number = 0) {
  const result = new Date();
  result.setDate(result.getDate() + days);
  return Number(result.getTime() / 1000).toFixed();
}

const batchMultiSigSelector = "0xa7973c1f";

const variableBase = "0xFC00000000000000000000000000000000000000";
const FDBase = "0xFD00000000000000000000000000000000000000";
const FDBaseBytes = "0xFD00000000000000000000000000000000000000000000000000000000000000";

export class BatchMultiSigCall {
  private FactoryProxy: ethers.Contract;

  options: MSCallOptions = {
    maxGasPrice: 25000000000,
    validFrom: getDate(), // Valid from now
    expiresAt: getDate(30), // Expires after 30 days
    purgeable: false,
    cancelable: true,
    builder: "0x0000000000000000000000000000000000000000",
  };

  variables: string[][] = [];
  calls: MSCallInput[] = [];

  constructor({
    provider,
    contractAddress,
    options,
  }: {
    provider: ethers.providers.JsonRpcProvider;
    contractAddress: string;
    options?: MSCallOptions;
  }) {
    this.FactoryProxy = new ethers.Contract(contractAddress, FactoryProxyABI, provider);

    this.options = {
      ...this.options,
      ...options,
    };
  }

  // Validate

  public validate(call: MSCallInput) {
    if (!utils.isAddress(call.from) && this.getVariableIndex(call.from) === -1) {
      throw new Error("From value is not an address");
    }

    if (BigNumber.from(call.value).lt(0)) {
      throw new Error("Value cannot be negative");
    }
    return true;
  }

  // Variables

  public createVariable(variableId: string, value?: string): string[] {
    this.variables = [...this.variables, [variableId, value ?? undefined]];
    return this.variables.map((item) => item[0]);
  }

  public addVariableValue(variableId: string, value: string) {
    const index = this.getVariableIndex(variableId);
    this.variables[index][1] = value;
    return this.variables.map((item) => item[0]);
  }

  private getVariableIndex(variableId: string, throwError: boolean = true): number {
    const index = this.variables.findIndex((item) => item[0] === variableId);
    if (index === -1 && throwError) {
      throw new Error(`Variable ${variableId} doesn't exist`);
    }
    return index;
  }

  public getVariableValue(variableId: string): string {
    const index = this.getVariableIndex(variableId);
    if (index === -1) {
      throw new Error(`Variable ${variableId} doesn't exist`);
    }
    return String(index + 1).padStart(variableBase.length, variableBase);
  }

  public getCallValue(index: number, bytes: boolean = false) {
    return (index + 1).toString(16).padStart(bytes ? FDBaseBytes.length : FDBase.length, bytes ? FDBaseBytes : FDBase);
  }

  public getVariablesAsBytes32() {
    return this.variables.map((item) => {
      const value = item[1];
      if (value === undefined) {
        throw new Error(`Variable ${item[0]} doesn't have a value`);
      }

      if (isNaN(Number(value)) || utils.isAddress(value)) {
        return `0x${String(value).replace("0x", "").padStart(64, "0")}`;
      }

      return `0x${Number(value).toString(16).padStart(64, "0")}`;
    });
  }

  // End of variables
  //
  //
  // Options

  public setOptions(options: MSCallOptions): MSCallOptions {
    this.options = { ...this.options, ...options };
    return this.options;
  }

  // End of options
  //
  //
  // FCT functions

  public getPlugin = async (dataOrIndex: MSCall | number): Promise<PluginInstance> => {
    if (typeof dataOrIndex === "number") {
      const call = this.getCall(dataOrIndex);
      if (!call.method) {
        throw new Error("Method is required to get plugin");
      }
      const Plugin = getPlugin({ signature: getMethodInterface(call) });
      const initPlugin = new Plugin();

      // @ts-ignore
      await initPlugin.reverseCall(call);

      return initPlugin;
    } else {
      const Plugins = getPlugins({ by: { methodInterfaceHash: dataOrIndex.functionSignature } });
      if (!Plugins || Plugins.length === 0) {
        throw new Error("No plugin found");
      }

      const initPlugin = new Plugins[0]();

      // @ts-ignore
      await initPlugin.reverseCall(dataOrIndex);

      return initPlugin;
    }
  };

  public getAllPlugins = (): Plugin[] => {
    return getPlugins({});
  };

  public async create(callInput: MSCallInput | IWithPlugin, index?: number): Promise<MSCallInput[]> {
    let call: MSCallInput;
    if ("plugin" in callInput) {
      const pluginCall = await callInput.plugin.create();
      call = { ...pluginCall, from: callInput.from, options: callInput.options } as MSCallInput;
    } else {
      if (!callInput.to) {
        throw new Error("To address is required");
      }
      call = { ...callInput } as MSCallInput;
    }
    if (index) {
      const length = this.calls.length;
      if (index > length) {
        throw new Error(`Index ${index} is out of bounds.`);
      }
      this.calls.splice(index, 0, call);
    } else {
      this.calls.push(call);
    }

    return this.calls;
  }

  public replaceCall(tx: MSCallInput, index: number): MSCallInput[] {
    if (index >= this.calls.length) {
      throw new Error(`Index ${index} is out of bounds.`);
    }
    this.calls[index] = tx;
    return this.calls;
  }

  public removeCall(index: number): MSCallInput[] {
    if (index >= this.calls.length) {
      throw new Error(`Index ${index} is out of bounds.`);
    }
    this.calls.splice(index, 1);
    return this.calls;
  }

  public getCall(index: number): MSCallInput {
    return this.calls[index];
  }

  get length(): number {
    return this.calls.length;
  }

  public async exportFCT(): Promise<
    | {
        typedData: TypedData;
        typeHash: string;
        sessionId: string;
        nameHash: string;
        mcall: MSCall[];
      }
    | Error
  > {
    if (this.calls.length === 0) {
      throw new Error("No calls added");
    }
    const typedHashes: string[] = [];
    const additionalTypes = {};

    const salt: string = [...Array(6)].map(() => Math.floor(Math.random() * 16).toString(16)).join("");
    const version: string = "0x010101";

    const typedData: TypedData = await this.createTypedData(additionalTypes, typedHashes, salt, version);

    const sessionId: string = getSessionId(salt, this.options);

    const mcall: MSCall[] = this.calls.map((call, index) => ({
      typeHash: ethers.utils.hexlify(TypedDataUtils.typeHash(typedData.types, `transaction${index + 1}`)),
      ensHash: handleEnsHash(call),
      functionSignature: handleFunctionSignature(call),
      value: call.value || "0",
      callId: manageCallId(call, index + 1),
      from: utils.isAddress(call.from) ? call.from : this.getVariableValue(call.from),
      to: this.handleTo(call),
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
      nameHash: id(this.options.name || ""),
      mcall, // This is where are the MSCall[] are returned
    };
  }

  public async importFCT(fct: IBatchMultiSigCallFCT): Promise<MSCallInput[] | Error> {
    // Here we import FCT and add all the data inside BatchMultiSigCall
    const options = parseSessionID(fct.sessionId);
    this.setOptions(options);
    const typedData = fct.typedData;

    // TODO: Get everything through typedData object (EIP712)
    for (const [index, call] of fct.mcall.entries()) {
      const dataTypes = typedData.types[`transaction${index + 1}`].slice(1);
      const { meta } = typedData.message[`transaction_${index + 1}`];

      const decodedParams = new AbiCoder().decode(
        dataTypes.map((type) => `${type.type} ${type.name}`),
        call.data
      );

      const params = dataTypes.map((t) => ({
        name: t.name,
        type: t.type,
        value: BigNumber.isBigNumber(decodedParams[t.name]) ? decodedParams[t.name].toString() : decodedParams[t.name],
      }));

      const getFlow = () => {
        const flow = Object.entries(flows).find(([, value]) => {
          return value.text === meta.flow_control.toString();
        });
        return Flow[flow[0]];
      };

      const callInput: MSCallInput = {
        to: call.to,
        from: call.from,
        value: call.value,
        method: meta.method_interface.split("(")[0],
        params,
        toENS: meta.to_ens,
        viewOnly: meta.view_only,
        options: {
          gasLimit: meta.gas_limit,
          jumpOnSuccess: meta.jump_on_success,
          jumpOnFail: meta.jump_on_fail,
          flow: getFlow(),
        },
      };

      this.create(callInput);
    }

    return this.calls;
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
    const typedDataMessage = this.calls.reduce((acc: object, call: MSCallInput, index: number) => {
      // Update params if variables (FC) or references (FD) are used
      let paramsData = {};
      if (call.params) {
        this.verifyParams(call.params, index, additionalTypes, typedHashes);
        paramsData = this.getParams(call);
      }

      const options = call.options || {};
      const gasLimit = options.gasLimit ?? 0;
      const flow = options.flow ? flows[options.flow].text : "continue on success, revert on fail";
      const jumpOnSuccess = options.jumpOnSuccess ?? 0;
      const jumpOnFail = options.jumpOnFail ?? 0;

      return {
        ...acc,
        [`transaction_${index + 1}`]: {
          meta: {
            call_index: index + 1,
            payer_index: index + 1,
            from: utils.isAddress(call.from) ? call.from : this.getVariableValue(call.from),
            to: this.handleTo(call),
            to_ens: call.toENS || "",
            eth_value: call.value || "0",
            gas_limit: gasLimit,
            view_only: call.viewOnly || false,
            permissions: 0,
            flow_control: flow,
            jump_on_success: jumpOnSuccess,
            jump_on_fail: jumpOnFail,
            method_interface: handleMethodInterface(call),
          },
          ...paramsData,
        },
      };
    }, {});

    let optionalMessage = {};
    let optionalTypes = {};
    const primaryType = [];

    if ("recurrency" in this.options) {
      optionalMessage = {
        recurrency: {
          max_repeats: this.options.recurrency.maxRepeats || "1",
          chill_time: this.options.recurrency.chillTime || "0",
          accumetable: this.options.recurrency.accumetable || false,
        },
      };
      optionalTypes = {
        Recurrency: [
          { name: "max_repeats", type: "uint16" },
          { name: "chill_time", type: "uint32" },
          { name: "accumetable", type: "bool" },
        ],
      };
      primaryType.push({ name: "recurrency", type: "Recurrency" });
    }

    if ("multisig" in this.options) {
      optionalMessage = {
        ...optionalMessage,
        multisig: {
          external_signers: this.options.multisig.externalSigners,
          minimum_approvals: this.options.multisig.minimumApprovals || 2,
        },
      };
      optionalTypes = {
        ...optionalTypes,
        Multisig: [
          { name: "external_signers", type: "address[]" },
          { name: "minimum_approvals", type: "uint8" },
        ],
      };
      primaryType.push({ name: "multisig", type: "Multisig" });
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
          { name: "fct", type: "FCT" },
          { name: "limits", type: "Limits" },
          ...this.calls.map((_, index) => ({
            name: `transaction_${index + 1}`,
            type: `transaction${index + 1}`,
          })),
        ],
        FCT: [
          { name: "name", type: "string" },
          { name: "builder", type: "address" },
          { name: "selector", type: "bytes4" },
          { name: "version", type: "bytes3" },
          { name: "random_id", type: "bytes3" },
          { name: "eip712", type: "bool" },
        ],
        Limits: [
          { name: "valid_from", type: "uint40" },
          { name: "expires_at", type: "uint40" },
          { name: "gas_price_limit", type: "uint64" },
          { name: "purgeable", type: "bool" },
          { name: "cancelable", type: "bool" },
        ],
        ...optionalTypes,
        ...this.calls.reduce(
          (acc: object, call: MSCallInput, index: number) => ({
            ...acc,
            [`transaction${index + 1}`]: call.validator
              ? [{ name: "meta", type: "Transaction" }, ...getValidatorFunctionData(call.validator, call.params)]
              : [
                  { name: "meta", type: "Transaction" },
                  ...(call.params || []).map((param: Params) => ({
                    name: param.name,
                    type: param.type,
                  })),
                ],
          }),
          {}
        ),
        ...additionalTypes,
        Transaction: [
          { name: "call_index", type: "uint16" },
          { name: "payer_index", type: "uint16" },
          { name: "from", type: "address" },
          { name: "to", type: "address" },
          { name: "to_ens", type: "string" },
          { name: "eth_value", type: "uint256" },
          { name: "gas_limit", type: "uint32" },
          { name: "view_only", type: "bool" },
          { name: "permissions", type: "uint16" },
          { name: "flow_control", type: "string" },
          { name: "jump_on_success", type: "uint16" },
          { name: "jump_on_fail", type: "uint16" },
          { name: "method_interface", type: "string" },
        ],
      },
      primaryType: "BatchMultiSigCall",
      domain: await getTypedDataDomain(this.FactoryProxy),
      message: {
        fct: {
          name: this.options.name || "",
          builder: this.options.builder,
          selector: batchMultiSigSelector,
          version,
          random_id: `0x${salt}`,
          eip712: true,
        },
        limits: {
          valid_from: this.options.validFrom, // TODO: Valid from the moment of creating FCT as default value
          expires_at: this.options.expiresAt, // TODO: Expires after 30 days as default
          gas_price_limit: this.options.maxGasPrice, // 20 GWei as default
          purgeable: this.options.purgeable,
          cancelable: this.options.cancelable,
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
            call.validator.params[key] = this.getVariableValue(this.variables[index][0]);
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
                    item2.value = this.getVariableValue(item2.variable);
                  }
                  return { ...acc, [item2.name]: item2.value };
                }, {})
              );
            } else {
              // If parameter is a custom type
              const valueArray = param.value as Params[];
              value = valueArray.reduce((acc, item) => {
                if (item.variable) {
                  item.value = this.getVariableValue(item.variable);
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
        param.value = this.getVariableValue(param.variable);
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
    return this.getVariableValue(call.to);
  };
}
