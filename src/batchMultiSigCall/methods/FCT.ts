import { ChainId, getPlugin as getPluginProvider } from "@kirobo/ki-eth-fct-provider-ts";
import { TypedDataUtils } from "@metamask/eth-sig-util";
import { BigNumber, utils } from "ethers";
import { AbiCoder } from "ethers/lib/utils";

import FCTBatchMultiSigCallABI from "../../abi/FCT_BatchMultiSigCall.abi.json";
import { Flow, flows } from "../../constants";
import { BatchMultiSigCall } from "../batchMultiSigCall";
import {
  getSessionId,
  getUsedStructTypes,
  handleData,
  handleEnsHash,
  handleFunctionSignature,
  handleTypes,
  manageCallId,
  parseCallID,
  parseSessionID,
} from "../helpers";
import { IBatchMultiSigCallFCT, IMSCallInput, IWithPlugin, TypedDataMessageTransaction } from "../types";

export async function create(this: BatchMultiSigCall, callInput: IMSCallInput | IWithPlugin): Promise<IMSCallInput[]> {
  let call: IMSCallInput;
  if ("plugin" in callInput) {
    const pluginCall = await callInput.plugin.create();
    if (pluginCall === undefined) {
      throw new Error("Error creating call with plugin");
    }
    call = {
      ...pluginCall,
      from: callInput.from,
      options: { ...pluginCall.options, ...callInput.options },
      nodeId: callInput.nodeId,
    };
  } else {
    call = { ...callInput };
  }
  if (!call.to) {
    throw new Error("To address is required");
  }
  if (!call.from) {
    throw new Error("From address is required");
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

export async function createMultiple(
  this: BatchMultiSigCall,
  calls: (IMSCallInput | IWithPlugin)[]
): Promise<IMSCallInput[]> {
  for (const call of calls) {
    await this.create(call);
  }
  return this.calls;
}

export function getCall(this: BatchMultiSigCall, index: number): IMSCallInput {
  return this.calls[index];
}

export async function exportFCT(this: BatchMultiSigCall): Promise<IBatchMultiSigCallFCT> {
  this.computedVariables = [];

  if (this.calls.length === 0) {
    throw new Error("No calls added");
  }

  if (this.options.builder) {
    utils.isAddress(this.options.builder);
  }

  const salt: string = [...Array(6)].map(() => Math.floor(Math.random() * 16).toString(16)).join("");
  const version = "0x010101";
  const typedData = await this.createTypedData(salt, version);
  const sessionId: string = getSessionId(salt, this.options);

  const mcall = this.calls.map((call, index) => {
    const usedTypeStructs = getUsedStructTypes(typedData, `transaction${index + 1}`);

    return {
      typeHash: utils.hexlify(TypedDataUtils.hashType(`transaction${index + 1}`, typedData.types)),
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
          ? usedTypeStructs.map((hash) => utils.hexlify(TypedDataUtils.hashType(hash, typedData.types)))
          : [],
    };
  });

  return {
    typedData,
    builder: this.options.builder || "0x0000000000000000000000000000000000000000",
    typeHash: utils.hexlify(TypedDataUtils.hashType(typedData.primaryType as string, typedData.types)),
    sessionId,
    nameHash: utils.id(this.options.name || ""),
    mcall,
    variables: [],
    externalSigners: [],
    computed: this.computedVariables,
  };
}

export function importFCT(this: BatchMultiSigCall, fct: IBatchMultiSigCallFCT): IMSCallInput[] {
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
      // viewOnly: meta.view_only,
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

export async function importEncodedFCT(this: BatchMultiSigCall, calldata: string) {
  const ABI = FCTBatchMultiSigCallABI;
  const iface = new utils.Interface(ABI);

  let chainId: ChainId;

  if (this.chainId) {
    chainId = this.chainId.toString() as ChainId;
  } else {
    const data = await this.provider.getNetwork();
    chainId = data.chainId.toString() as ChainId;
  }

  const decoded = iface.decodeFunctionData("batchMultiSigCall", calldata);

  const arrayKeys = ["signatures", "mcall"];
  const objectKeys = ["tr"];

  const getFCT = (obj: object) => {
    return Object.entries(obj).reduce((acc, [key, value]) => {
      if (!isNaN(parseFloat(key))) {
        return acc;
      }

      if (arrayKeys.includes(key)) {
        return {
          ...acc,
          [key]: value.map((sign) => getFCT(sign)),
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
          [key]: value.map((type) => type.toString()),
        };
      }

      return {
        ...acc,
        [key]: BigNumber.isBigNumber(value) ? value.toHexString() : value,
      };
    }, {});
  };

  const decodedFCT: {
    version: string;
    tr: Omit<IBatchMultiSigCallFCT, "typedData">;
    purgeFCT: string;
    investor: string;
    activator: string;
  } = getFCT(decoded);

  const FCTOptions = parseSessionID(decodedFCT.tr.sessionId, decodedFCT.tr.builder);
  this.setOptions(FCTOptions);

  for (const [index, call] of decodedFCT.tr.mcall.entries()) {
    try {
      const pluginData = getPluginProvider({
        address: call.to,
        chainId,
        signature: call.functionSignature,
      });

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
          const getValue = (value: any) => {
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

          const value = getValue(decodedParams[param.name]);

          return { ...acc, [param.name]: value };
        }, {}),
      });

      const { options } = parseCallID(call.callId);

      const callInput: IWithPlugin = {
        nodeId: `node${index + 1}`,
        plugin,
        from: call.from,
        options,
      };

      await this.create(callInput);
    } catch (e) {
      if (e.message !== "Multiple plugins found for the same signature, can't determine which one to use") {
        throw new Error(`Plugin error for call at index ${index} - ${e.message}`);
      }
      throw new Error(`Plugin not found for call at index ${index}`);
    }
  }

  return this.calls;
}