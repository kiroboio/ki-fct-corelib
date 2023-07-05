import { AllPlugins, ChainId, getPlugin as getPluginProvider } from "@kiroboio/fct-plugins";
import { TypedDataUtils } from "@metamask/eth-sig-util";
import { BigNumber, ethers, utils } from "ethers";
import { hexlify, id } from "ethers/lib/utils";

import { CALL_TYPE_MSG_REV, Flow } from "../../constants";
import { flows } from "../../constants/flows";
import { Interfaces } from "../../helpers/Interfaces";
import { FCTInputCall, IFCT, Param } from "../../types";
import { BatchMultiSigCall } from "../batchMultiSigCall";
import { Call, CallID, EIP712, SessionID } from "../classes";
import { getParamsFromTypedData } from "../classes/Call/helpers";
import { Multicall } from "../classes/Call/Multicall/Multicall";
import { FCTCall, IMSCallInput, TypedDataMessageTransaction } from "../types";
import { PluginParams } from "./types";

const AbiCoder = ethers.utils.AbiCoder;

export async function create<F extends FCTInputCall>(this: BatchMultiSigCall, call: F) {
  if (call instanceof Multicall) {
    this._calls.push(call);
    return call;
  }
  const newCall = await Call.create({
    FCT: this,
    call,
  });
  this._calls.push(newCall);
  return newCall;
}

export async function createMultiple(this: BatchMultiSigCall, calls: FCTInputCall[]): Promise<FCTCall[]> {
  const callsCreated: FCTCall[] = [];
  for (const [index, call] of calls.entries()) {
    try {
      const createdCall = await this.create(call);
      callsCreated.push(createdCall);
    } catch (err) {
      if (err instanceof Error) {
        throw new Error(`Error creating call ${index + 1}: ${err.message}`);
      }
    }
  }
  return callsCreated;
}

export function createPlugin<T extends AllPlugins>(
  this: BatchMultiSigCall,
  {
    plugin,
    initParams,
  }: {
    plugin: T;
    initParams?: PluginParams<T>;
  }
) {
  const Plugin = new plugin({
    chainId: this.chainId,
    initParams: initParams ?? {},
  });
  if (Plugin instanceof plugin) {
    return Plugin;
  } else {
    throw new Error(`Plugin creation failed: ${JSON.stringify(plugin)}`);
  }
}

export function getCall(this: BatchMultiSigCall, index: number): FCTCall {
  if (index < 0 || index >= this._calls.length) {
    throw new Error("Index out of range");
  }
  return this._calls[index];
}

export function getCallByNodeId(this: BatchMultiSigCall, nodeId: string): FCTCall {
  const call = this._calls.find((c) => c.get.nodeId === nodeId);
  if (!call) {
    throw new Error(`Call with nodeId ${nodeId} not found`);
  }
  return call;
}

export function exportFCT(this: BatchMultiSigCall): IFCT {
  const typedData = new EIP712(this).getTypedData();
  return {
    typedData,
    builder: this.options.builder,
    typeHash: hexlify(TypedDataUtils.hashType(typedData.primaryType as string, typedData.types)),
    sessionId: new SessionID(this).asString(),
    nameHash: id(this.options.name),
    mcall: this.pureCalls.map((call, index) => {
      return call.getAsMCall(typedData, index);
    }),
    variables: [],
    externalSigners: this.options.multisig.externalSigners,
    signatures: [this.utils.getAuthenticatorSignature()],
    computed: this.computedAsData,
    validations: this.validation.getForData,
    appHash: id(this.options.app),
    byHash: id(this.options.by),
  };
}

export function exportNotificationFCT(this: BatchMultiSigCall): IFCT {
  const callDefault = this.callDefault;
  this.setCallDefaults({
    options: {
      payerIndex: 0,
    },
  });
  const fct = this.exportFCT();
  this.setCallDefaults(callDefault);
  return fct;
}

export function importFCT<FCT extends IFCT>(this: BatchMultiSigCall, fct: FCT) {
  const typedData = fct.typedData;
  const domain = typedData.domain;
  const { meta } = typedData.message;
  this.batchMultiSigSelector = meta.selector;
  this.version = meta.version;
  this.chainId = domain.chainId.toString() as ChainId;
  this.domain = domain;
  this.randomId = meta.random_id.slice(2);

  this.setOptions(
    SessionID.asOptions({
      sessionId: fct.sessionId,
      builder: fct.builder,
      externalSigners: fct.externalSigners,
      name: typedData.message.meta.name,
    })
  );
  const { types: typesObject } = typedData;

  for (const [index, call] of fct.mcall.entries()) {
    // Slice the first element because it is the call type
    const dataTypes = [...typedData.types[`transaction${index + 1}`]].slice(1);
    const { call: meta, ...parameters } = typedData.message[`transaction_${index + 1}`] as TypedDataMessageTransaction;

    let params: Param[] = [];

    if (dataTypes.length > 0) {
      const signature = meta.method_interface;
      const functionName = signature.split("(")[0];

      const iface = new ethers.utils.Interface([`function ${signature}`]);

      const ifaceFunction = iface.getFunction(functionName);
      const inputs = ifaceFunction.inputs;

      params = getParamsFromTypedData({
        methodInterfaceParams: inputs,
        parameters,
        types: typesObject,
        primaryType: `transaction${index + 1}`,
      });
    }

    const getFlow = () => {
      const flow = Object.entries(flows).find(([, value]) => {
        return value.text === meta.flow_control.toString();
      });
      if (!flow) {
        throw new Error("Flow control not found");
      }
      return Flow[flow[0] as keyof typeof Flow];
    };

    const callInput: IMSCallInput = {
      nodeId: `node${index + 1}`,
      to: call.to,
      from: call.from,
      value: call.value,
      method: meta.method_interface.split("(")[0],
      params,
      toENS: meta.to_ens,
      options: {
        gasLimit: meta.gas_limit,
        jumpOnSuccess: meta.jump_on_success === 0 ? "" : `node${index + meta.jump_on_success}`,
        jumpOnFail: meta.jump_on_fail === 0 ? "" : `node${index + meta.jump_on_fail}`,
        flow: getFlow(),
        callType: CALL_TYPE_MSG_REV[meta.call_type as keyof typeof CALL_TYPE_MSG_REV],
        falseMeansFail: meta.returned_false_means_fail,
        permissions: meta.permissions.toString(),
      },
    };

    const callClass = new Call({
      FCT: this,
      input: callInput,
    });

    this._calls.push(callClass);
  }

  return this.calls;
}

export async function importEncodedFCT(this: BatchMultiSigCall, calldata: string) {
  const iface = Interfaces.FCT_BatchMultiSigCall;
  const chainId = this.chainId;
  const decoded = iface.decodeFunctionData("batchMultiSigCall", calldata);

  const arrayKeys = ["signatures", "mcall"];
  const objectKeys = ["tr"];

  const getFCT = (obj: object): Record<"version" | "tr" | "purgeFCT" | "investor" | "activator", any> => {
    return Object.entries(obj).reduce((acc, [key, value]) => {
      if (!isNaN(parseFloat(key))) {
        return acc;
      }

      if (arrayKeys.includes(key)) {
        return {
          ...acc,
          [key]: (value as object[]).map((sign) => getFCT(sign)),
        };
      }

      if (objectKeys.includes(key)) {
        return {
          ...acc,
          [key]: getFCT(value),
        };
      }

      if (key === "callId" || key === "sessionId") {
        return {
          ...acc,
          [key]: "0x" + value.toHexString().slice(2).padStart(64, "0"),
        };
      }

      if (key === "types") {
        return {
          ...acc,
          [key]: (value as BigNumber[]).map((type) => type.toString()),
        };
      }

      return {
        ...acc,
        [key]: BigNumber.isBigNumber(value) ? value.toHexString() : value,
      };
    }, {} as Record<"version" | "tr" | "purgeFCT" | "investor" | "activator", any>);
  };

  const decodedFCT: {
    version: string;
    tr: Omit<IFCT, "typedData">;
    purgeFCT: string;
    investor: string;
    activator: string;
  } = getFCT(decoded);

  const FCTOptions = SessionID.asOptions({
    sessionId: decodedFCT.tr.sessionId,
    builder: decodedFCT.tr.builder,
    name: "",
    externalSigners: decodedFCT.tr.externalSigners,
  });
  this.setOptions(FCTOptions);

  for (const [index, call] of decodedFCT.tr.mcall.entries()) {
    try {
      const pluginData = getPluginProvider({
        address: call.to,
        chainId,
        signature: call.functionSignature,
      });

      if (!pluginData) {
        throw new Error("Plugin not found");
      }

      const plugin = new pluginData.plugin({
        chainId,
      });

      const params = plugin.methodParams;

      const decodedParams =
        params.length > 0
          ? new AbiCoder().decode(
              params.map((type) => `${type.type} ${type.name}`),
              call.data
            )
          : [];

      plugin.input.set({
        to: call.to,
        value: parseInt(call.value, 16).toString(),
        methodParams: params.reduce((acc, param) => {
          const getValue = (value: utils.Result) => {
            const variables = ["0xfb0", "0xfa0", "0xfc00000", "0xfd00000", "0xfdb000"];
            if (BigNumber.isBigNumber(value)) {
              const hexString = value.toHexString();
              if (variables.some((v) => hexString.startsWith(v))) {
                return hexString;
              }

              return value.toString();
            }

            return value;
          };

          const value = getValue((decodedParams as ethers.utils.Result)[param.name]);

          return { ...acc, [param.name]: value };
        }, {}),
      });

      const { options } = CallID.parse(call.callId);

      const callInput = {
        nodeId: `node${index + 1}`,
        plugin,
        from: call.from,
        options: options as any,
      };

      await this.create(callInput);
    } catch (e: any) {
      if (e.message !== "Multiple plugins found for the same signature, can't determine which one to use") {
        throw new Error(`Plugin error for call at index ${index} - ${e.message}`);
      }
      throw new Error(`Plugin not found for call at index ${index}`);
    }
  }

  return this.calls;
}
