import { AllPlugins } from "@kiroboio/fct-plugins";
import { TypedDataUtils } from "@metamask/eth-sig-util";
import { hexlify, id } from "ethers/lib/utils";

import { CALL_TYPE, CALL_TYPE_MSG } from "../../../constants";
import { flows } from "../../../constants/flows";
import { InstanceOf } from "../../../helpers";
import { deepMerge } from "../../../helpers/deepMerge";
import {
  BatchMultiSigCallTypedData,
  CallOptions,
  DecodedCalls,
  DeepPartial,
  DeepRequired,
  FCTCallParam,
  IWithPlugin,
  MSCall,
  Param,
  ParamWithoutVariable,
  StrictMSCallInput,
  TypedDataMessageTransaction,
} from "../../../types";
import { BatchMultiSigCall } from "../../batchMultiSigCall";
import { NO_JUMP } from "../../constants";
import { IMSCallInput } from "../../types";
import { CallID } from "../CallID";
import { getFee } from "../FCTUtils/getPaymentPerPayer";
import { IValidation, ValidationVariable } from "../Validation/types";
import { CallBase } from "./CallBase";
import { generateNodeId, getAllSimpleParams, getParams, isAddress, isInteger, verifyParam } from "./helpers";
import { decodeFromData, getEncodedMethodParams } from "./helpers/callParams";
import { ICall } from "./types";

export class Call extends CallBase implements ICall {
  protected FCT: BatchMultiSigCall;
  public readonly plugin: InstanceType<AllPlugins> | undefined;

  constructor({
    FCT,
    input,
    isImport,
    plugin,
  }: {
    FCT: BatchMultiSigCall;
    input: IMSCallInput;
    isImport?: boolean;
    plugin?: InstanceType<AllPlugins>;
  }) {
    super(input);
    this.FCT = FCT;

    this._verifyCall({ call: this.call });

    // Check if this is the first call, we should increase the gas limit by 40k. Else 15k
    if (!isImport && this._call.options?.gasLimit) {
      if (FCT.calls.length === 0) {
        const fee = getFee("mcallOverheadFirstCall", FCT.chainId);
        this._call.options = deepMerge(this._call.options, {
          gasLimit: (BigInt(this._call.options?.gasLimit || 50_000) + fee).toString(),
        });
      } else {
        const fee = getFee("mcallOverheadOtherCalls", FCT.chainId);
        this._call.options = deepMerge(this._call.options, {
          gasLimit: (BigInt(this._call.options?.gasLimit || 50_000) + fee).toString(),
        });
      }
    }

    if (plugin) {
      this.plugin = plugin;
    }

    // If validation, add it to the validation list
    if (input.addValidation) {
      this.FCT.validation.add({
        validation: input.addValidation,
        nodeId: this.nodeId,
      });
    }
  }

  //
  // Setter methods
  //

  public update(call: DeepPartial<IMSCallInput>) {
    const data = deepMerge(this._call, call);
    // Verify the call
    this._verifyCall({ call: data, update: true });
    this._call = data as IMSCallInput & { nodeId: string };
    return this.get();
  }

  public addValidation(validation: IValidation<true>): ValidationVariable {
    const validationVariable = this.FCT.validation.add({
      validation,
      nodeId: this.nodeId,
    });
    this.setOptions({ validation: validationVariable.id });
    return validationVariable;
  }

  //
  // Getter methods
  //

  get options(): DeepRequired<CallOptions> {
    return this.get().options;
  }

  public isComputedUsed(id: string) {
    // Computed Variable can be used as value, to, from, param values.
    // We need to check all of them
    const call = this.get();
    const checks = [call.value, call.from, call.to, ...getAllSimpleParams(call.params || [])];

    return checks.some((item) => {
      if (InstanceOf.Variable(item)) {
        return item.id === id;
      }
      return false;
    });
  }

  public get(): StrictMSCallInput {
    const payerIndex = this.FCT.getIndexByNodeId(this.call.nodeId);
    return deepMerge(this.FCT.callDefault, { options: { payerIndex: payerIndex + 1 } }, this.call) as StrictMSCallInput;
  }

  public getDecoded(): DecodedCalls {
    const params = this.get().params;
    if (params && params.length > 0) {
      const parameters = this._decodeParams(params);
      return { ...this.get(), params: parameters };
    }
    return {
      ...this.get(),
      params: [] as ParamWithoutVariable<Param>[],
    };
  }

  public getAsMCall(typedData: BatchMultiSigCallTypedData, index: number): MSCall {
    const call = this.get();
    return {
      typeHash: hexlify(TypedDataUtils.hashType(`transaction${index + 1}`, typedData.types)),
      ensHash: id(call.toENS || ""),
      functionSignature: this.getFunctionSignature(),
      value: this.FCT.variables.getValue(call.value, "uint256", "0"),
      callId: CallID.asString({
        calls: this.FCT.callsAsObjects,
        validation: this.FCT.validation,
        call,
        index,
      }),
      from: this.FCT.variables.getValue(call.from, "address"),
      to: this.FCT.variables.getValue(call.to, "address"),
      data: this.getEncodedData(),
      types: this.getTypesArray(),
      typedHashes: this.getTypedHashes(index),
    };
  }

  //
  // EIP 712 methods
  //
  public generateEIP712Type(index: number) {
    const call = this.get();

    if (!call.params || (call.params && call.params.length === 0)) {
      return {
        structTypes: {},
        callType: [{ name: "call", type: "Call" }],
      };
    }

    const structTypes: { [key: string]: { name: string; type: string }[] } = {};

    const callParameters = call.params.map((param: Param) => {
      const typeName = this._getStructType({
        param,
        nodeId: index.toString(),
        structTypes,
      });

      return {
        name: param.name,
        type: typeName,
      };
    });
    return {
      structTypes,
      callType: [{ name: "call", type: "Call" }, ...callParameters],
    };
  }

  public generateEIP712Message(index: number): TypedDataMessageTransaction {
    const paramsData = this._getParamsEIP712();
    const call = this.get();
    const options = this.options;
    const flow = flows[options.flow].text;

    const { jumpOnSuccess, jumpOnFail } = this._getJumps(index);

    return {
      call: {
        call_index: index + 1,
        payer_index: index + 1,
        call_type: CALL_TYPE_MSG[call.options.callType],
        from: this.FCT.variables.getValue(call.from, "address"),
        to: this.FCT.variables.getValue(call.to, "address"),
        to_ens: call.toENS || "",
        value: this.FCT.variables.getValue(call.value, "uint256", "0"),
        gas_limit: options.gasLimit,
        permissions: 0,
        validation: call.options.validation ? this.FCT.validation.getIndex(call.options.validation) : 0,
        flow_control: flow,
        returned_false_means_fail: options.falseMeansFail,
        jump_on_success: jumpOnSuccess,
        jump_on_fail: jumpOnFail,
        method_interface: this.getFunction(),
      },
      ...paramsData,
    };
  }

  public getTypedHashes(index: number): string[] {
    const { structTypes, callType } = this.generateEIP712Type(index);

    return this._getUsedStructTypes(structTypes, callType.slice(1)).map((type) => {
      return hexlify(TypedDataUtils.hashType(type, structTypes));
    });
  }

  public getEncodedData(): string {
    return getEncodedMethodParams(this.getDecoded());
  }

  public decodeData(data: string) {
    return decodeFromData(this.getDecoded(), data);
  }

  //
  // Private methods
  //
  private _getUsedStructTypes(
    typedData: Record<string, { name: string; type: string }[]>,
    mainType: { name: string; type: string }[],
  ): string[] {
    return mainType.reduce((acc, item) => {
      if (item.type.includes("Struct_")) {
        const type = item.type.replace("[]", "");
        return [...acc, type, ...this._getUsedStructTypes(typedData, typedData[type])];
      }
      return acc;
    }, [] as string[]);
  }

  private _getStructType({
    param,
    nodeId,
    structTypes = {},
  }: {
    param: Param;
    nodeId: string;
    structTypes?: Record<string, { name: string; type: string }[]>;
  }): string {
    if (!param.customType && !param.type.includes("tuple")) {
      return param.type;
    }

    let paramValue: Param[] | Param[][];

    if (InstanceOf.TupleArray(param.value, param)) {
      paramValue = param.value[0];
    } else if (InstanceOf.Tuple(param.value, param)) {
      paramValue = param.value;
    } else {
      throw new Error(`Invalid param value: ${param.value} for param: ${param.name}`);
    }

    const generalType = paramValue.map((item) => {
      if (item.customType || item.type.includes("tuple")) {
        const typeName = this._getStructType({
          param: item,
          nodeId,
          structTypes,
        });
        return {
          name: item.name,
          type: typeName,
        };
      }
      return {
        name: item.name,
        type: item.hashed ? "string" : item.type,
      };
    });

    // If param type is array, we need to add [] to the end of the type
    const typeName = `Struct_${nodeId}_${Object.keys(structTypes).length}`;
    structTypes[typeName] = generalType;
    return typeName + (param.type.includes("[]") ? "[]" : "");
  }

  private _getParamsEIP712(): Record<string, FCTCallParam> {
    const decoded = this.getDecoded();
    return decoded.params
      ? {
          ...getParams(decoded.params),
        }
      : {};
  }

  private _getJumps(index: number): { jumpOnSuccess: number; jumpOnFail: number } {
    let jumpOnSuccess = 0;
    let jumpOnFail = 0;
    const call = this.get();
    const options = call.options;

    if (options.jumpOnSuccess && options.jumpOnSuccess !== NO_JUMP) {
      const jumpOnSuccessIndex = this.FCT.calls.findIndex((c) => c.nodeId === options.jumpOnSuccess);

      if (jumpOnSuccessIndex === -1) {
        throw new Error(`Jump on success node id ${options.jumpOnSuccess} not found`);
      }

      if (jumpOnSuccessIndex <= index) {
        throw new Error(
          `Jump on success node id ${options.jumpOnSuccess} is current or before current node (${call.nodeId})`,
        );
      }

      jumpOnSuccess = jumpOnSuccessIndex - index - 1;
    }

    if (options.jumpOnFail && options.jumpOnFail !== NO_JUMP) {
      const jumpOnFailIndex = this.FCT.calls.findIndex((c) => c.nodeId === options.jumpOnFail);

      if (jumpOnFailIndex === -1) {
        throw new Error(`Jump on fail node id ${options.jumpOnFail} not found`);
      }

      if (jumpOnFailIndex <= index) {
        throw new Error(
          `Jump on fail node id ${options.jumpOnFail} is current or before current node (${call.nodeId})`,
        );
      }

      jumpOnFail = jumpOnFailIndex - index - 1;
    }

    return {
      jumpOnSuccess,
      jumpOnFail,
    };
  }

  private _decodeParams<P extends Param>(params: P[]): ParamWithoutVariable<P>[] {
    return params.reduce((acc, param) => {
      if (param.type === "tuple" || param.customType) {
        if (param.type.lastIndexOf("[") > 0) {
          const value = param.value as Param[][];
          const decodedValue = value.map((tuple) => this._decodeParams(tuple));
          return [...acc, { ...param, value: decodedValue }];
        }

        const value = this._decodeParams(param.value as Param[]);
        return [...acc, { ...param, value }];
      }
      // If param type is any of the arrays, we need to decode each item
      if (param.type.includes("[")) {
        const type = param.type.slice(0, param.type.lastIndexOf("["));
        const value = param.value as any;
        return [
          ...acc,
          {
            ...param,
            value: value.map((item: any) => {
              if (InstanceOf.Variable(item)) {
                return this.FCT.variables.getVariable(item, type);
              }
              return item;
            }),
          },
        ];
      }

      if (InstanceOf.Variable(param.value)) {
        const value = this.FCT.variables.getVariable(param.value, param.type);
        const updatedParam = { ...param, value };
        return [...acc, updatedParam];
      }
      return [...acc, param as ParamWithoutVariable<P>];
    }, [] as ParamWithoutVariable<P>[]);
  }

  private _verifyCall({ call, update = false }: { call: IMSCallInput; update?: boolean }) {
    // To address validator
    if (!call.to) {
      throw new Error("To address is required");
    } else if (typeof call.to === "string") {
      isAddress(call.to, "To");
    }

    // Value validator
    if (call.value && typeof call.value === "string") {
      isInteger(call.value, "Value");
    }

    // Method validator
    if (call.method && call.method.length === 0) {
      throw new Error("Method cannot be empty string");
    }

    // Node ID validator
    if (call.nodeId) {
      let index: number;
      if (update) {
        // If it is an update, we need to ignore the current node ID
        const currentCallIndex = this.FCT.getIndexByNodeId(this.nodeId);
        // Ignore the current node ID from this.calls;
        const calls = this.FCT.calls.filter((item, i) => i !== currentCallIndex);
        index = calls.findIndex((item) => item.nodeId === call.nodeId);
      } else {
        index = this.FCT.calls.findIndex((item) => item.nodeId === call.nodeId);
      }
      if (index > -1) {
        throw new Error(`Node ID ${call.nodeId} already exists, please use a different one`);
      }
    }

    // Options validator
    if (call.options) {
      const { gasLimit, callType } = call.options;
      if (gasLimit) {
        isInteger(gasLimit, "Gas limit");
      }
      if (callType) {
        const keysOfCALLTYPE = Object.keys(CALL_TYPE);
        if (!keysOfCALLTYPE.includes(callType)) {
          throw new Error(`Call type ${callType} is not valid`);
        }
      }
    }

    if (call.params && call.params.length) {
      if (!call.method) {
        throw new Error("Method is required when params are present");
      }

      call.params.map(verifyParam);
    }
  }
  static async create({ call, FCT }: { call: IMSCallInput | IWithPlugin; FCT: BatchMultiSigCall }) {
    if (InstanceOf.CallWithPlugin(call)) {
      return await this._createWithPlugin(FCT, call);
    } else {
      return this._createSimpleCall(FCT, call);
    }
  }

  private static async _createWithPlugin(FCT: BatchMultiSigCall, callWithPlugin: IWithPlugin): Promise<Call> {
    if (!callWithPlugin.plugin) {
      throw new Error("Plugin is required to create a call with plugin.");
    }

    const pluginCall = await callWithPlugin.plugin.create();
    if (!pluginCall) {
      throw new Error("Error creating call with plugin. Make sure input values are valid");
    }

    const data = {
      ...pluginCall,
      from: callWithPlugin.from,
      options: { ...pluginCall.options, ...callWithPlugin.options },
      nodeId: callWithPlugin.nodeId || generateNodeId(),
    };
    return new Call({ FCT, input: data, plugin: callWithPlugin.plugin as InstanceType<AllPlugins> });
  }

  private static _createSimpleCall<C extends IMSCallInput>(FCT: BatchMultiSigCall, call: C): Call {
    return new Call({ FCT, input: call });
  }
}
