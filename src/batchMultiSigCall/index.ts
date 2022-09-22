import { BigNumber, ethers, utils } from "ethers";
import { TypedData, TypedDataUtils } from "ethers-eip712";
import FCT_ControllerABI from "../abi/FCT_Controller.abi.json";
import FCTBatchMultiSigCallABI from "../abi/FCT_BatchMultiSigCall.abi.json";
import FCTActuatorABI from "../abi/FCT_Actuator.abi.json";
import { Params, Variable } from "../interfaces";
import { MSCallInput, MSCall, MSCallOptions, IWithPlugin, IBatchMultiSigCallFCT } from "./interfaces";
import {
  getTypedDataDomain,
  createValidatorTxData,
  flows,
  getValidatorFunctionData,
  getMethodInterface,
} from "../helpers";
import {
  getSessionId,
  handleData,
  handleEnsHash,
  handleFunctionSignature,
  handleMethodInterface,
  handleTypes,
  instanceOfVariable,
  manageCallId,
  parseSessionID,
} from "./helpers";
import { AbiCoder, id } from "ethers/lib/utils";
import { Flow } from "../constants";
import { getPlugin, getPlugins, Plugin } from "@kirobo/ki-eth-fct-provider-ts";
import variables from "../variables";

function getDate(days: number = 0) {
  const result = new Date();
  result.setDate(result.getDate() + days);
  return Number(result.getTime() / 1000).toFixed();
}

const FCBase = "0xFC00000000000000000000000000000000000000";
const FCBaseBytes = "0xFC00000000000000000000000000000000000000000000000000000000000000";

const FDBase = "0xFD00000000000000000000000000000000000000";
const FDBaseBytes = "0xFD00000000000000000000000000000000000000000000000000000000000000";

const FDBackBase = "0xFDB0000000000000000000000000000000000000";
const FDBackBaseBytes = "0xFDB0000000000000000000000000000000000000000000000000000000000000";

export class BatchMultiSigCall {
  private FCT_Controller: ethers.Contract;
  private FCT_BatchMultiSigCall: ethers.utils.Interface;
  private batchMultiSigSelector: string = "0xa7973c1f";
  private provider: ethers.providers.JsonRpcProvider;

  options: MSCallOptions = {
    maxGasPrice: "100000000000", // 100 Gwei as default
    validFrom: getDate(), // Valid from now
    expiresAt: getDate(7), // Expires after 7 days
    purgeable: false,
    blockable: true,
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
    options?: Partial<MSCallOptions>;
  }) {
    this.FCT_Controller = new ethers.Contract(contractAddress, FCT_ControllerABI, provider);
    this.FCT_BatchMultiSigCall = new ethers.utils.Interface(FCTBatchMultiSigCallABI);
    this.provider = provider;

    this.options = {
      ...this.options,
      ...options,
    };
  }

  // Helpers

  public getCalldataForActuator = async (
    actuatorAddress: string,
    signedFCTs: object[],
    listOfPurgedFCTs: string[] = []
  ) => {
    const version = "010101";
    const actuator = new ethers.Contract(actuatorAddress, FCTActuatorABI, this.provider);
    const nonce = BigInt(await actuator.s_nonces(this.batchMultiSigSelector + version.slice(0, 2).padEnd(56, "0")));

    const activateId =
      "0x" + version + "0".repeat(34) + (nonce + BigInt("1")).toString(16).padStart(16, "0") + "0".repeat(8);

    return this.FCT_BatchMultiSigCall.encodeFunctionData("batchMultiSigCall", [
      activateId,
      signedFCTs,
      listOfPurgedFCTs,
    ]);
  };

  // Variables

  private getVariable(variable: Variable, type: string) {
    if (variable.type === "external") {
      return this.getExternalVariable(variable.id as number, type);
    }
    if (variable.type === "output") {
      const id = variable.id as { nodeId: string; innerIndex: number };
      const indexForNode = this.calls.findIndex((call) => call.nodeId === id.nodeId);

      return this.getOutputVariable(indexForNode, id.innerIndex, type);
    }
    if (variable.type === "global") {
      const globalVariable = variables.globalVariables[variable.id];

      if (!globalVariable) {
        throw new Error("Global variable not found");
      }

      return globalVariable;
    }
  }

  private getOutputVariable(index: number, innerIndex: number, type: string) {
    const outputIndexHex = (index + 1).toString(16).padStart(3, "0");
    let base: string;
    let innerIndexHex: string;
    innerIndex = innerIndex ?? 0;

    if (innerIndex < 0) {
      innerIndexHex = ((innerIndex + 1) * -1).toString(16).padStart(3, "0");
      if (type.includes("bytes")) {
        base = FDBackBaseBytes;
      } else {
        base = FDBackBase;
      }
    }

    if (innerIndex >= 0) {
      innerIndexHex = innerIndex.toString(16).padStart(3, "0");
      if (type.includes("bytes")) {
        base = FDBaseBytes;
      } else {
        base = FDBase;
      }
    }

    return (innerIndexHex + outputIndexHex).padStart(base.length, base);
  }

  private getExternalVariable(index: number, type: string) {
    const outputIndexHex = (index + 1).toString(16).padStart(3, "0");

    if (type.includes("bytes")) {
      return outputIndexHex.padStart(FCBaseBytes.length, FCBaseBytes);
    }

    return outputIndexHex.padStart(FCBase.length, FCBase);
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

  public setOptions(options: Partial<MSCallOptions>): MSCallOptions {
    if (options.maxGasPrice !== undefined && options.maxGasPrice === "0") {
      throw new Error("Max gas price cannot be 0 or less");
    }

    if (options.expiresAt !== undefined) {
      const now = Number(new Date().getTime() / 1000).toFixed();
      if (options.expiresAt <= now) {
        throw new Error("Expires at must be in the future");
      }
    }

    this.options = { ...this.options, ...options };
    return this.options;
  }

  // End of options
  //
  //
  // Plugin functions

  public getPlugin = async (
    dataOrIndex: MSCall | number
  ): Promise<{ name: string; description?: string; plugin: Plugin }> => {
    if (typeof dataOrIndex === "number") {
      const call = this.getCall(dataOrIndex);
      if (!call.method) {
        throw new Error("Method is required to get plugin");
      }
      const Plugin = getPlugin({ signature: getMethodInterface(call) });

      return Plugin;
    } else {
      const Plugins = getPlugins({ by: { methodInterfaceHash: dataOrIndex.functionSignature } });
      if (!Plugins || Plugins.length === 0) {
        throw new Error("No plugin found");
      }

      return Plugins[0];
    }
  };

  public getAllPlugins = (): { name: string; description?: string; plugin: Plugin }[] => {
    return getPlugins({});
  };

  // End of plugin functions
  //
  //
  // FCT Functions

  public async create(callInput: MSCallInput | IWithPlugin): Promise<MSCallInput[]> {
    let call: MSCallInput;
    if ("plugin" in callInput) {
      const pluginCall = await callInput.plugin.create();
      if (pluginCall === undefined) {
        throw new Error("Error creating call with plugin");
      }
      call = {
        ...pluginCall,
        from: callInput.from,
        options: callInput.options,
        nodeId: callInput.nodeId,
      };
    } else {
      if (!callInput.to) {
        throw new Error("To address is required");
      }
      call = { ...callInput };
    }

    if (call.nodeId) {
      const index = this.calls.findIndex((call) => call.nodeId === callInput.nodeId);
      if (index > 0) {
        throw new Error("Node id already exists, please use different id");
      }
    }
    this.calls.push(call);

    return this.calls;
  }

  public async createMultiple(calls: (MSCallInput | IWithPlugin)[]): Promise<MSCallInput[]> {
    for (const call of calls) {
      await this.create(call);
    }
    return this.calls;
  }

  public getCall(index: number): MSCallInput {
    return this.calls[index];
  }

  get length(): number {
    return this.calls.length;
  }

  public async exportFCT(): Promise<{
    typedData: TypedData;
    typeHash: string;
    builder: string;
    sessionId: string;
    nameHash: string;
    mcall: MSCall[];
  }> {
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
      value: this.handleValue(call),
      callId: manageCallId(this.calls, call, index),
      from: typeof call.from === "string" ? call.from : this.getVariable(call.from, "address"),
      to: this.handleTo(call),
      data: handleData(call),
      types: handleTypes(call),
      typedHashes: typedHashes
        ? typedHashes.map((hash) => ethers.utils.hexlify(TypedDataUtils.typeHash(typedData.types, hash)))
        : [],
    }));

    return {
      typedData,
      builder: this.options.builder,
      typeHash: ethers.utils.hexlify(TypedDataUtils.typeHash(typedData.types, typedData.primaryType)),
      sessionId,
      nameHash: id(this.options.name || ""),
      mcall, // This is where are the MSCall[] are returned
    };
  }

  public async importFCT(fct: IBatchMultiSigCallFCT): Promise<MSCallInput[] | Error> {
    // Here we import FCT and add all the data inside BatchMultiSigCall
    const options = parseSessionID(fct.sessionId, fct.builder);
    this.setOptions(options);
    const typedData = fct.typedData;

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
        nodeId: `node${index + 1}`,
        to: call.to,
        from: call.from,
        value: call.value,
        method: meta.method_interface.split("(")[0],
        params,
        toENS: meta.to_ens,
        viewOnly: meta.view_only,
        options: {
          gasLimit: meta.gas_limit,
          jumpOnSuccess: meta.jump_on_success === 0 ? "" : `node${index + meta.jump_on_success}`,
          jumpOnFail: meta.jump_on_fail === 0 ? "" : `node${index + meta.jump_on_fail}`,
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
        this.verifyParams(call.params, additionalTypes, typedHashes);
        paramsData = this.getParams(call);
      }

      const options = call.options || {};
      const gasLimit = options.gasLimit ?? 0;
      const flow = options.flow ? flows[options.flow].text : "continue on success, revert on fail";

      let jumpOnSuccess = 0;
      let jumpOnFail = 0;

      if (options.jumpOnSuccess) {
        const jumpOnSuccessIndex = this.calls.findIndex((c) => c.nodeId === options.jumpOnSuccess);
        jumpOnSuccess = jumpOnSuccessIndex - index;
      }

      if (options.jumpOnFail) {
        const jumpOnFailIndex = this.calls.findIndex((c) => c.nodeId === options.jumpOnFail);
        jumpOnFail = jumpOnFailIndex - index;
      }

      return {
        ...acc,
        [`transaction_${index + 1}`]: {
          meta: {
            call_index: index + 1,
            payer_index: index + 1,
            from: typeof call.from === "string" ? call.from : this.getVariable(call.from, "address"),
            to: this.handleTo(call),
            to_ens: call.toENS || "",
            eth_value: this.handleValue(call),
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
          max_repeats: this.options?.recurrency?.maxRepeats || "1",
          chill_time: this.options?.recurrency?.chillTime || "0",
          accumetable: this.options?.recurrency?.accumetable || false,
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
          external_signers: this.options?.multisig?.externalSigners,
          minimum_approvals: this.options?.multisig?.minimumApprovals || 2,
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
          ...primaryType,
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
          { name: "blockable", type: "bool" },
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
      domain: await getTypedDataDomain(this.FCT_Controller),
      message: {
        fct: {
          name: this.options.name || "",
          builder: this.options.builder,
          selector: this.batchMultiSigSelector,
          version,
          random_id: `0x${salt}`,
          eip712: true,
        },
        limits: {
          valid_from: this.options.validFrom,
          expires_at: this.options.expiresAt,
          gas_price_limit: this.options.maxGasPrice,
          purgeable: this.options.purgeable,
          blockable: this.options.blockable,
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
          if (typeof value !== "string") {
            call.validator.params[key] = this.getVariable(value, "uint256");
          }
        });

        return createValidatorTxData(call);
      }

      return {
        ...call.params.reduce((acc, param) => {
          let value: any;

          // If parameter is a custom type (struct)
          if (param.customType) {
            // If parameter is an array of custom types
            if (param.type.lastIndexOf("[") > 0) {
              const valueArray = param.value as Params[][];
              value = valueArray.map((item) =>
                item.reduce((acc, item2) => {
                  return { ...acc, [item2.name]: item2.value };
                }, {})
              );
            } else {
              // If parameter is a custom type
              const valueArray = param.value as Params[];
              value = valueArray.reduce((acc, item) => {
                return { ...acc, [item.name]: item.value };
              }, {});
            }
          } else {
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

  private verifyParams(params: Params[], additionalTypes: object, typedHashes: string[]) {
    params.forEach((param) => {
      // If parameter is a variable
      if (instanceOfVariable(param.value)) {
        param.value = this.getVariable(param.value, param.type);
      }

      if (param.customType) {
        if (additionalTypes[param.type]) {
          return;
        }
        if (param.type.lastIndexOf("[") > 0) {
          const type = param.type.slice(0, param.type.lastIndexOf("["));
          typedHashes.push(type);

          for (const parameter of param.value as Params[][]) {
            this.verifyParams(parameter as Params[], additionalTypes, typedHashes);
          }

          const arrayValue = param.value[0] as Params[];
          additionalTypes[type] = arrayValue.map((item) => ({ name: item.name, type: item.type }));
        } else {
          const type = param.type;
          typedHashes.push(type);

          this.verifyParams(param.value as Params[], additionalTypes, typedHashes);

          const arrayValue = param.value as Params[];
          additionalTypes[type] = arrayValue.map((item) => ({ name: item.name, type: item.type }));
        }
      }
    });
  }
  private handleTo = (call: MSCallInput) => {
    // If call is a validator method, return validator address as to address
    if (call.validator) {
      return call.validator.validatorAddress;
    }

    if (typeof call.to === "string") {
      return call.to;
    }

    // Else it is a variable
    return this.getVariable(call.to, "address");
  };

  private handleValue = (call: MSCallInput): string => {
    // If value isn't provided => 0
    if (!call.value) {
      return "0";
    }

    // Check if value is a number
    if (typeof call.value === "string") {
      return call.value;
    }

    // Else it is a variable
    return this.getVariable(call.value as Variable, "uint256");
  };
}
