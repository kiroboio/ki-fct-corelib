import { AllPlugins, getPlugin, Multicall } from "@kiroboio/fct-plugins";
import { TypedDataUtils } from "@metamask/eth-sig-util";
import { hexlify } from "ethers/lib/utils";

import { isVariable } from "../../../constants";
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
import { isComputedVariable, isExternalVariable, isGlobalVariable, isOutputVariable } from "../../../variables";
import { BatchMultiSigCall } from "../../batchMultiSigCall";
import { NO_JUMP } from "../../constants";
import { IMSCallInput, MSCall_Eff } from "../../types";
import { getVersionClass } from "../../versions/getVersion";
import { CallID } from "../CallID";
import { IValidation, ValidationVariable } from "../Validation/types";
import { CallBase } from "./CallBase";
import { generateNodeId, getAllSimpleParams, getParams } from "./helpers";
import { getCallGasLimit } from "./helpers/callGas";
import { decodeFromData, decodeOutputData, getEncodedMethodParams } from "./helpers/callParams";
import { verifyCall } from "./helpers/verifyCall";
import { ICall } from "./types";

export class Call extends CallBase implements ICall {
  protected FCT: BatchMultiSigCall;
  public readonly plugin: InstanceType<AllPlugins> | undefined;
  isImport?: boolean;

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
    this.isImport = isImport || false;

    this._verifyCall({ call: this.call });

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
    const defaults = { ...this.FCT.callDefault.options };
    return deepMerge(defaults, this.call.options);
  }

  public getMergedCall() {
    const payerIndex = this.FCT.getIndexByNodeId(this.call.nodeId);
    const callDefaults = { ...this.FCT.callDefault };
    return deepMerge(callDefaults, { options: { payerIndex: payerIndex + 1 } }, this.call) as StrictMSCallInput;
  }

  public get(): StrictMSCallInput {
    const payerIndex = this.FCT.getIndexByNodeId(this.call.nodeId);
    const callDefaults = { ...this.FCT.callDefault };
    // const data = deepClone<StrictMSCallInput>(deepMerge(callDefaults, this.call));
    const data = structuredClone(deepMerge(callDefaults, this.call));

    if (data.options.payerIndex === undefined) {
      data.options.payerIndex = payerIndex + 1;
    }

    if (!this.isImport && data.options.gasLimit && data.options.gasLimit !== "0") {
      data.options.gasLimit = getCallGasLimit({
        payerIndex,
        value: data.value,
        callType: data.options.callType,
        gasLimit: data.options.gasLimit,
        calls: this.FCT.calls,
      });
    }

    return data;
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
    const Version = getVersionClass(this.FCT);
    return Version.getCallAsMcall(this, typedData, index);
  }

  public getAsEfficientMCall(index: number): MSCall_Eff {
    const call = this.get();
    return {
      to: this.FCT.variables.getValue(call.to, "address"),
      value: this.FCT.variables.getValue(call.value, "uint256", "0"),
      data: this.getEncodedDataWithSignature(),
      callid: CallID.asString({
        calls: this.FCT.calls,
        validation: this.FCT.validation,
        call: this.get(),
        index,
        payerIndex: this.options.payerIndex,
      }),
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
    const Version = getVersionClass(this.FCT);

    return {
      call: Version.generateCallForEIP712Message(this, index),
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

  public getEncodedDataWithSignature(): string {
    const funcSigAsBytes4 = this.getFunctionSignature().slice(0, 10);
    const encodedData = this.getEncodedData().replace(/^0x/, "");
    return funcSigAsBytes4 + encodedData;
  }

  public decodeData({ inputData, outputData }: { inputData: string; outputData?: string }) {
    const res: { inputData: any[]; outputData: any[] | null } = {} as any;
    res.inputData = decodeFromData(this.getDecoded(), inputData) as any[];
    if (outputData) {
      const to = this.get().to;
      const pluginData = getPlugin({
        signature: this.getFunctionSignature(),
        address: typeof to === "string" ? to : "",
        chainId: this.FCT.chainId,
      });
      // TODO: Technically if it is an array, we can go over every plugin, set data
      // and check if parameters fit in the plugin
      if (!pluginData || Array.isArray(pluginData)) return null;
      let plugin: any;
      if (pluginData instanceof Multicall) {
        plugin = pluginData;
        plugin.setMethodParams(res.inputData);
      } else {
        // @ts-ignore
        plugin = new pluginData.plugin({
          walletAddress: "0x",
          chainId: this.FCT.chainId,
        } as any);
      }

      res.outputData = decodeOutputData(plugin, outputData);
    } else {
      res.outputData = [];
    }

    return res;
  }

  public decodeOutputData(data: string) {
    if (this.plugin) {
      return decodeOutputData(this.plugin, data);
    }

    const to = this.get().to;
    const pluginData = getPlugin({
      signature: this.getFunctionSignature(),
      address: typeof to === "string" ? to : "",
      chainId: this.FCT.chainId,
    });
    if (!pluginData || Array.isArray(pluginData)) return null;

    return decodeOutputData(
      // @ts-ignore
      new pluginData.plugin({
        walletAddress: "0x",
        chainId: this.FCT.chainId,
      } as any),
      data,
    );
  }

  //
  // Variable methods
  //

  public isComputedUsed(id?: string, index?: number) {
    // Computed Variable can be used as value, to, from, param values.
    // We need to check all of them
    const call = this.getMergedCall();
    const checks = [call.value, call.from, call.to, ...getAllSimpleParams(call.params || [])];

    return checks.some((item) => {
      return isComputedVariable({
        // If id and index are provided, strict: true else strict: false
        strict: id && index ? true : false,
        value: item,
        id,
        index,
      });
    });
  }

  public isExternalVariableUsed() {
    const call = this.getMergedCall();
    const checks = [call.value, call.from, call.to, ...getAllSimpleParams(call.params || [])];

    return checks.some(isExternalVariable);
  }

  public isAnyVariableUsed() {
    const call = this.getMergedCall();
    const useMaxVarLength = this.options.useMaxVarLength;
    const valuesToCheck = [call.value, call.from, call.to, ...getAllSimpleParams(call.params || [])];
    return (
      useMaxVarLength ||
      valuesToCheck.some((value) =>
        Boolean(
          isComputedVariable({ value, strict: false }) ||
            isExternalVariable(value) ||
            isOutputVariable({ value, index: 0, strict: false }) ||
            isGlobalVariable(value),
        ),
      )
    );
  }

  //
  // Helper methods
  //
  public getJumps(index: number): { jumpOnSuccess: number; jumpOnFail: number } {
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
      if (param.value && (isVariable(param.value) || InstanceOf.Variable(param.value))) {
        return "uint256";
      }
      return param.messageType || param.type;
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
      if (item.value && (isVariable(item.value) || InstanceOf.Variable(item.value))) {
        return {
          name: item.name,
          type: "uint256",
        };
      }
      return {
        name: item.name,
        type: item.messageType || item.type,
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
    verifyCall({
      call,
      update,
      FCT: this.FCT,
    });
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
