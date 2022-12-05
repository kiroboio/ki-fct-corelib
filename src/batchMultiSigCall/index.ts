import { BigNumber, ethers, utils } from "ethers";
import { AbiCoder, id } from "ethers/lib/utils";
import { ChainId, getPlugin, PluginInstance } from "@kirobo/ki-eth-fct-provider-ts";
import { TypedDataUtils } from "@metamask/eth-sig-util";
import FCT_ControllerABI from "../abi/FCT_Controller.abi.json";
import FCTBatchMultiSigCallABI from "../abi/FCT_BatchMultiSigCall.abi.json";
import { Params, Variable } from "../interfaces";
import { getTypedDataDomain, createValidatorTxData, flows } from "../helpers";
import {
  IMSCallInput,
  MSCallOptions,
  IWithPlugin,
  IBatchMultiSigCallFCT,
  BatchMultiSigCallTypedData,
  TypedDataMessageTransaction,
} from "./interfaces";
import {
  getSessionId,
  getTxEIP712Types,
  getUsedStructTypes,
  handleData,
  handleEnsHash,
  handleFunctionSignature,
  handleMethodInterface,
  handleTypes,
  instanceOfVariable,
  manageCallId,
  parseSessionID,
} from "./helpers";
import { Flow } from "../constants";
import variables from "../variables";

// Comment

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
  private batchMultiSigSelector: string = "0x07eefcb4";
  private provider: ethers.providers.JsonRpcProvider | ethers.providers.Web3Provider;
  private chainId: number;

  calls: IMSCallInput[] = [];
  options: MSCallOptions = {
    maxGasPrice: "100000000000", // 100 Gwei as default
    validFrom: getDate(), // Valid from now
    expiresAt: getDate(7), // Expires after 7 days
    purgeable: false,
    blockable: true,
    builder: "0x0000000000000000000000000000000000000000",
  };

  constructor({
    provider,
    contractAddress,
    options,
    chainId,
  }: {
    provider?: ethers.providers.JsonRpcProvider | ethers.providers.Web3Provider;
    contractAddress?: string;
    options?: Partial<MSCallOptions>;
    chainId?: number;
  }) {
    if (contractAddress) {
      this.FCT_Controller = new ethers.Contract(contractAddress, FCT_ControllerABI, provider);
    } else {
      this.FCT_Controller = new ethers.Contract(
        "0x0000000000000000000000000000000000000000",
        FCT_ControllerABI,
        provider
      );
    }

    if (chainId) {
      this.chainId = chainId;
    }

    this.FCT_BatchMultiSigCall = new ethers.utils.Interface(FCTBatchMultiSigCallABI);
    this.provider = provider;

    if (options) {
      this.setOptions(options);
    }
  }

  // Helpers

  public getCalldataForActuator = async ({
    signedFCT,
    purgedFCT,
    investor,
    activator,
    version,
  }: {
    signedFCT: object;
    purgedFCT: string;
    investor: string;
    activator: string;
    version: string;
  }) => {
    return this.FCT_BatchMultiSigCall.encodeFunctionData("batchMultiSigCall", [
      `0x${version}`.padEnd(66, "0"),
      signedFCT,
      purgedFCT,
      investor,
      activator,
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
    const outputIndexHex = (index + 1).toString(16).padStart(4, "0");
    let base: string;
    let innerIndexHex: string;
    innerIndex = innerIndex ?? 0;

    if (innerIndex < 0) {
      innerIndexHex = ((innerIndex + 1) * -1).toString(16).padStart(4, "0");
      if (type.includes("bytes")) {
        base = FDBackBaseBytes;
      } else {
        base = FDBackBase;
      }
    }

    if (innerIndex >= 0) {
      innerIndexHex = innerIndex.toString(16).padStart(4, "0");
      if (type.includes("bytes")) {
        base = FDBaseBytes;
      } else {
        base = FDBase;
      }
    }

    return (innerIndexHex + outputIndexHex).padStart(base.length, base);
  }

  private getExternalVariable(index: number, type: string) {
    const outputIndexHex = (index + 1).toString(16).padStart(4, "0");

    if (type.includes("bytes")) {
      return outputIndexHex.padStart(FCBaseBytes.length, FCBaseBytes);
    }

    return outputIndexHex.padStart(FCBase.length, FCBase);
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

    if (options.builder !== undefined && !ethers.utils.isAddress(options.builder)) {
      throw new Error("Builder must be a valid address");
    }

    this.options = { ...this.options, ...options };
    return this.options;
  }

  // End of options
  //
  //
  // Plugin functions

  public getPlugin = async (index: number): Promise<PluginInstance> => {
    let chainId: number;

    if (this.chainId) {
      chainId = this.chainId;
    } else {
      const data = await this.provider.getNetwork();
      chainId = data.chainId;
    }
    const call = this.getCall(index);

    if (instanceOfVariable(call.to)) {
      throw new Error("To value cannot be a variable");
    }

    const pluginData = getPlugin({
      signature: handleFunctionSignature(call),
      address: call.to,
      chainId: "1",
    });

    const pluginClass = pluginData.plugin as any;

    const plugin = new pluginClass({
      chainId: chainId.toString() as ChainId,
    }) as PluginInstance;

    plugin.input.set({
      to: call.to,
      methodParams: call.params.reduce((acc, param) => {
        return { ...acc, [param.name]: param.value };
      }, {}),
    });

    return plugin;
  };

  public getPluginClass = async (index: number): Promise<any> => {
    const { chainId } = await this.provider.getNetwork();
    const call = this.getCall(index);

    if (instanceOfVariable(call.to)) {
      throw new Error("To value cannot be a variable");
    }

    const pluginData = getPlugin({
      signature: handleFunctionSignature(call),
      address: call.to,
      chainId: chainId.toString() as ChainId,
    });

    return pluginData;
  };

  // End of plugin functions
  //
  //
  // FCT Functions

  public async create(callInput: IMSCallInput | IWithPlugin): Promise<IMSCallInput[]> {
    let call: IMSCallInput;
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

  public async createMultiple(calls: (IMSCallInput | IWithPlugin)[]): Promise<IMSCallInput[]> {
    for (const call of calls) {
      await this.create(call);
    }
    return this.calls;
  }

  public getCall(index: number): IMSCallInput {
    return this.calls[index];
  }

  get length(): number {
    return this.calls.length;
  }

  public async exportFCT(): Promise<IBatchMultiSigCallFCT> {
    if (this.calls.length === 0) {
      throw new Error("No calls added");
    }

    if (this.options.builder) {
      utils.isAddress(this.options.builder);
    }

    const salt: string = [...Array(6)].map(() => Math.floor(Math.random() * 16).toString(16)).join("");
    const version: string = "0x010101";
    const typedData = await this.createTypedData(salt, version);
    const sessionId: string = getSessionId(salt, this.options);

    const mcall = this.calls.map((call, index) => {
      const usedTypeStructs = getUsedStructTypes(typedData, `transaction${index + 1}`);

      return {
        typeHash: ethers.utils.hexlify(TypedDataUtils.hashType(`transaction${index + 1}`, typedData.types)),
        ensHash: handleEnsHash(call),
        functionSignature: handleFunctionSignature(call),
        value: this.handleValue(call),
        callId: manageCallId(this.calls, call, index),
        from: typeof call.from === "string" ? call.from : this.getVariable(call.from, "address"),
        to: this.handleTo(call),
        data: handleData(call),
        types: handleTypes(call),
        typedHashes:
          usedTypeStructs.length > 0
            ? usedTypeStructs.map((hash) => ethers.utils.hexlify(TypedDataUtils.hashType(hash, typedData.types)))
            : [],
      };
    });

    return {
      typedData,
      builder: this.options.builder || "0x0000000000000000000000000000000000000000",
      typeHash: ethers.utils.hexlify(TypedDataUtils.hashType(typedData.primaryType as string, typedData.types)),
      sessionId,
      nameHash: id(this.options.name || ""),
      mcall,
      variables: [],
      externalSigners: [],
    };
  }

  public importFCT(fct: IBatchMultiSigCallFCT): IMSCallInput[] {
    // Here we import FCT and add all the data inside BatchMultiSigCall
    const options = parseSessionID(fct.sessionId, fct.builder);
    this.setOptions(options);
    const typedData = fct.typedData;

    for (const [index, call] of fct.mcall.entries()) {
      const dataTypes = typedData.types[`transaction${index + 1}`].slice(1);
      const { call: meta } = typedData.message[`transaction_${index + 1}`] as TypedDataMessageTransaction;

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

      const callInput: IMSCallInput = {
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

  private async createTypedData(salt: string, version: string): Promise<BatchMultiSigCallTypedData> {
    // Creates messages from multiCalls array for EIP712 sign
    const typedDataMessage = this.calls.reduce((acc: object, call: IMSCallInput, index: number) => {
      // Update params if variables (FC) or references (FD) are used
      let paramsData = {};
      if (call.params) {
        this.verifyParams(call.params);
        paramsData = this.getParamsFromCall(call);
      }

      const options = call.options || {};
      const gasLimit = options.gasLimit ?? 0;
      const flow = options.flow ? flows[options.flow].text : "continue on success, revert on fail";

      let jumpOnSuccess = 0;
      let jumpOnFail = 0;

      if (options.jumpOnSuccess) {
        const jumpOnSuccessIndex = this.calls.findIndex((c) => c.nodeId === options.jumpOnSuccess);

        if (jumpOnSuccessIndex === -1) {
          throw new Error(`Jump on success node id ${options.jumpOnSuccess} not found`);
        }

        if (jumpOnSuccessIndex <= index) {
          throw new Error(
            `Jump on success node id ${options.jumpOnSuccess} is current or before current node (${call.nodeId})`
          );
        }

        jumpOnSuccess = jumpOnSuccessIndex - index - 1;
      }

      if (options.jumpOnFail) {
        const jumpOnFailIndex = this.calls.findIndex((c) => c.nodeId === options.jumpOnFail);

        if (jumpOnFailIndex === -1) {
          throw new Error(`Jump on fail node id ${options.jumpOnFail} not found`);
        }

        if (jumpOnFailIndex <= index) {
          throw new Error(
            `Jump on fail node id ${options.jumpOnFail} is current or before current node (${call.nodeId})`
          );
        }

        jumpOnFail = jumpOnFailIndex - index - 1;
      }

      return {
        ...acc,
        [`transaction_${index + 1}`]: {
          call: {
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
            returned_false_means_fail: options.falseMeansFail || false,
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

    const { structTypes, txTypes } = getTxEIP712Types(this.calls);

    const typedData: BatchMultiSigCallTypedData = {
      types: {
        EIP712Domain: [
          { name: "name", type: "string" },
          { name: "version", type: "string" },
          { name: "chainId", type: "uint256" },
          { name: "verifyingContract", type: "address" },
          { name: "salt", type: "bytes32" },
        ],
        BatchMultiSigCall: [
          { name: "meta", type: "Meta" },
          { name: "limits", type: "Limits" },
          ...primaryType,
          ...this.calls.map((_, index) => ({
            name: `transaction_${index + 1}`,
            type: `transaction${index + 1}`,
          })),
        ],
        Meta: [
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
        ...txTypes,
        ...structTypes,
        Call: [
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
          { name: "returned_false_means_fail", type: "bool" },
          { name: "jump_on_success", type: "uint16" },
          { name: "jump_on_fail", type: "uint16" },
          { name: "method_interface", type: "string" },
        ],
      },
      primaryType: "BatchMultiSigCall",
      domain: await getTypedDataDomain(this.FCT_Controller),
      message: {
        meta: {
          name: this.options.name || "",
          builder: this.options.builder || "0x0000000000000000000000000000000000000000",
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

  private getParamsFromCall(call: IMSCallInput) {
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
      const getParams = (params: Params[]) => {
        return {
          ...params.reduce((acc, param) => {
            let value: any;

            // If parameter is a custom type (struct)
            if (param.customType || param.type.includes("tuple")) {
              // If parameter is an array of custom types
              if (param.type.lastIndexOf("[") > 0) {
                const valueArray = param.value as Params[][];
                value = valueArray.map((item) => getParams(item));
              } else {
                // If parameter is a custom type
                const valueArray = param.value as Params[];
                value = getParams(valueArray);
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
      };

      return getParams(call.params);
    }
    return {};
  }

  private verifyParams(params: Params[]) {
    params.forEach((param: Params) => {
      // If parameter is a variable

      if (instanceOfVariable(param.value)) {
        param.value = this.getVariable(param.value, param.type);
      }

      if (param.customType || param.type.includes("tuple")) {
        if (param.type.lastIndexOf("[") > 0) {
          for (const parameter of param.value as Params[][]) {
            this.verifyParams(parameter as Params[]);
          }
        } else {
          this.verifyParams(param.value as Params[]);
        }
      }
    });
  }

  private handleTo = (call: IMSCallInput) => {
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

  private handleValue = (call: IMSCallInput): string => {
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
