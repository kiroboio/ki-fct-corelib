import { AllPlugins, ChainId, Erc20Approvals } from "@kiroboio/fct-plugins";
import { TypedDataUtils } from "@metamask/eth-sig-util";
import { ethers } from "ethers";
import { hexlify, id } from "ethers/lib/utils";

import { CALL_TYPE_MSG_REV, Flow } from "../../constants";
import { flows } from "../../constants/flows";
import { CallOptions, FCTInputCall, IFCT, IRequiredApproval, Param, Variable } from "../../types";
import { BatchMultiSigCall } from "../batchMultiSigCall";
import { Call, EIP712, SessionID } from "../classes";
import { getParamsFromTypedData, manageValue } from "../classes/Call/helpers";
import { IValidationEIP712 } from "../classes/Validation/types";
import { IComputedEIP712 } from "../classes/Variables/types";
import { FCTCall, IFCTOptions, IMSCallInput, TypedDataMessageTransaction } from "../types";
import { PluginParams } from "./types";

// If F is Multicall, return multicall, else return Call
// type CreateOutput<F extends FCTInputCall> = F extends Multicall ? Multicall : Call;

export async function create(this: BatchMultiSigCall, call: FCTInputCall) {
  // If the input is already made Call class, we just add it to _calls.
  if (call instanceof Call) {
    this._calls.push(call);
    return call;
  }
  // Else we create Call class from the input
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

export async function addAtIndex(this: BatchMultiSigCall, call: FCTInputCall, index: number): Promise<FCTCall> {
  if (index < 0 || index > this._calls.length) {
    throw new Error("Index out of range");
  }

  if (call instanceof Call) {
    this._calls.splice(index, 0, call);
    return call;
  }
  const newCall = await Call.create({
    FCT: this,
    call,
  });
  this._calls.splice(index, 0, newCall);
  return newCall;
}

export function createPlugin<T extends AllPlugins>(
  this: BatchMultiSigCall,
  {
    plugin,
    initParams,
  }: {
    plugin: T;
    initParams?: PluginParams<T>;
  },
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
  const call = this._calls.find((c) => c.nodeId === nodeId);
  if (!call) {
    throw new Error(`Call with nodeId ${nodeId} not found`);
  }
  return call;
}

export function getIndexByNodeId(this: BatchMultiSigCall, nodeId: string): number {
  return this._calls.findIndex((call) => call.nodeId === nodeId);
}

export function exportFCTMap(this: BatchMultiSigCall) {
  const calls = this.calls.map((call) => call.nodeId);
  const computed = this.computed.map((computed) => computed.id);
  const validations = this.validation.get().map((validation) => validation.id);

  return {
    calls,
    computed,
    validations,
  };
}

export function exportFCT(this: BatchMultiSigCall): IFCT {
  if (this.calls.length === 0) {
    throw new Error("No calls added to FCT");
  }
  // Check if every computed variable is used in a call
  const computedVariables = this.computed;
  for (const computedVariable of computedVariables) {
    const isUsed = this.calls.some((call) => call.isComputedUsed(computedVariable.id as string));
    if (!isUsed) {
      throw new Error(
        `Computed variable ${computedVariable.id} is not used. Make sure to remove it if the computed variable is not intended to be used.`,
      );
    }
  }

  const typedData = new EIP712(this).getTypedData();
  return {
    typedData,
    typeHash: hexlify(TypedDataUtils.hashType(typedData.primaryType as string, typedData.types)),
    sessionId: new SessionID(this).asString(),
    nameHash: id(this.options.name),
    appHash: id(this.options.app.name),
    appVersionHash: id(this.options.app.version),
    builderHash: id(this.options.builder.name),
    builderAddress: this.options.builder.address,
    domainHash: id(this.options.domain),
    verifierHash: id(this.options.verifier),
    mcall: this.calls.map((call, index) => call.getAsMCall(typedData, index)),
    externalSigners: this.options.multisig.externalSigners,
    signatures: [this.utils.getAuthenticatorSignature()],
    computed: this.computedAsData,
    validations: this.validation.getForData(),
    variables: [],
  };
}

export async function exportWithApprovals(this: BatchMultiSigCall) {
  const FCTData = this.exportFCT();
  const FCT = BatchMultiSigCall.from(FCTData);
  // Check if the FCT calls contain 2 erc20approvals and are at index 0 and last index
  const erc20Approvals = FCT.calls.filter((call, i) => {
    const getCall = call.get();
    return (
      getCall.method === "erc20Approvals" &&
      getCall.toENS === "@lib:multicall" &&
      (i === 0 || i === FCT.calls.length - 1)
    );
  });
  if (erc20Approvals.length !== 2) {
    return FCTData;
  }

  const signers = FCT.utils.getSigners();
  const requiredApprovals = (await FCT.utils.getAllRequiredApprovals()).filter(
    (approval) => approval.protocol === "ERC20",
  ) as (IRequiredApproval & { protocol: "ERC20" })[];
  for (const signer of signers) {
    // Get all approvals for the signer
    const approvals = requiredApprovals.filter((approval) => approval.from.toLowerCase() === signer.toLowerCase());

    const ERC20Approvals = new Erc20Approvals({
      chainId: FCT.chainId,
    });

    const ResetERC20Approvals = new Erc20Approvals({
      chainId: FCT.chainId,
    });

    ResetERC20Approvals.create();

    // Call ERC20Approvals.add approvals.length times
    for (let i = 1; i < approvals.length; i++) {
      ERC20Approvals.add();
      ResetERC20Approvals.add();
    }

    const pluginInterface = ERC20Approvals.getInterface();
    const resetPluginInterface = ResetERC20Approvals.getInterface();

    pluginInterface.instance.input.paramsList.forEach(({ param, key }) => {
      const approval = approvals[+key.slice(-1)];
      if (key.includes("token")) {
        param.setString({ value: approval.token });
      }
      if (key.includes("spender")) {
        param.setString({ value: approval.params.spender });
      }
      if (key.includes("amount")) {
        param.setString({ value: approval.params.amount });
      }
    });

    resetPluginInterface.instance.input.paramsList.forEach(({ param, key }) => {
      const approval = approvals[+key.slice(-1)];
      if (key.includes("token")) {
        param.setString({ value: approval.token });
      }
      if (key.includes("spender")) {
        param.setString({ value: approval.params.spender });
      }
      if (key.includes("amount")) {
        param.setString({ value: "0" });
      }
    });

    // Add approvals at the beginning
    await FCT.addAtIndex(
      {
        from: signer,
        plugin: ERC20Approvals,
      },
      0,
    );

    // Set reset approvals last
    await FCT.addAtIndex(
      {
        from: signer,
        plugin: ResetERC20Approvals,
      },
      FCT.calls.length,
    );
  }
  return FCT.exportFCT();
}

export function exportNotificationFCT(this: BatchMultiSigCall): IFCT {
  const fctOptions = this.options;
  this.setOptions({
    dryRun: true,
    maxGasPrice: "0",
  });
  const callOptionsBefore: CallOptions[] = [];
  // Update every call to have gasLimit 0 and save it to restore it later
  this._calls.forEach((call) => {
    callOptionsBefore.push(call.options);
    call.setOptions({
      gasLimit: "0",
    });
  });

  const fct = this.exportFCT();

  // Restore the original options
  this._calls.forEach((call, index) => {
    call.setOptions(callOptionsBefore[index]);
  });
  this.setOptions(fctOptions);
  return fct;
}

export function importFCT<FCT extends IFCT>(this: BatchMultiSigCall, fct: FCT) {
  const typedData = fct.typedData;
  const domain = typedData.domain;
  const { meta, engine } = typedData.message;
  this.batchMultiSigSelector = engine.selector;
  this.version = engine.version;
  this.chainId = domain.chainId.toString() as ChainId;
  this.domain = domain;
  this.randomId = engine.random_id.slice(2);

  const sessionIDOptions = SessionID.asOptions(fct.sessionId);

  const options: IFCTOptions = {
    id: "",
    ...SessionID.asOptions(fct.sessionId),
    authEnabled: engine.auth_enabled,
    domain: meta.domain,
    name: meta.name,
    verifier: engine.verifier,
    builder: {
      address: fct.builderAddress,
      name: meta.builder,
    },
    app: {
      name: meta.app,
      version: meta.app_version,
    },
    multisig: {
      externalSigners: fct.externalSigners,
      minimumApprovals: sessionIDOptions.multisig.minimumApprovals,
    },
  };

  this.setOptions(options);
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

    const callIndex = index + 1;

    const callInput: IMSCallInput = {
      nodeId: `node${callIndex}`,
      to: call.to,
      from: call.from,
      value: call.value,
      method: meta.method_interface.split("(")[0],
      params,
      toENS: meta.to_ens,
      options: {
        gasLimit: meta.gas_limit,
        jumpOnSuccess: meta.jump_on_success === 0 ? "" : `node${callIndex + 1 + meta.jump_on_success}`,
        jumpOnFail: meta.jump_on_fail === 0 ? "" : `node${callIndex + 1 + meta.jump_on_fail}`,
        flow: getFlow(),
        callType: CALL_TYPE_MSG_REV[meta.call_type as keyof typeof CALL_TYPE_MSG_REV],
        falseMeansFail: meta.returned_false_means_fail,
        permissions: meta.permissions.toString(),
        validation: meta.validation === 0 ? "" : meta.validation.toString(),
      },
    };

    const callClass = new Call({
      FCT: this,
      input: callInput,
    });

    this._calls.push(callClass);
  }

  // Get all computed variables names
  const computedVariableNames = typedData.types.BatchMultiSigCall.filter((val) => val.type === "Computed").map(
    (val) => val.name,
  );
  // Get all computed variables from typedData.message
  const computedVariables = computedVariableNames.map(
    (name) => typedData.message[name as keyof typeof typedData.message],
  ) as IComputedEIP712[];

  for (const computedVariable of computedVariables) {
    this.addComputed({
      id: computedVariable.index,
      value1: manageValue(computedVariable.value_1) as string | Variable,
      operator1: computedVariable.op_1,
      value2: manageValue(computedVariable.value_2) as string | Variable,
      operator2: computedVariable.op_2,
      value3: manageValue(computedVariable.value_3) as string | Variable,
      operator3: computedVariable.op_3,
      value4: manageValue(computedVariable.value_4) as string | Variable,
      overflowProtection: computedVariable.overflow_protection,
    });
  }

  const validationVariableNames = typedData.types.BatchMultiSigCall.filter((val) => val.type === "Validation").map(
    (val) => val.name,
  );

  const validaitonVariables = validationVariableNames.map(
    (name) => typedData.message[name as keyof typeof typedData.message],
  ) as unknown as IValidationEIP712[];

  for (const validationVariable of validaitonVariables) {
    this.validation.addValidation({
      id: validationVariable.index,
      value1: validationVariable.value_1,
      operator: validationVariable.op,
      value2: validationVariable.value_2,
    });
  }

  return this.calls;
}

// NOTE: For now not used - we have custom plugins that do the same thing
// export async function importEncodedFCT(this: BatchMultiSigCall, calldata: string) {
//   const iface = Interfaces.FCT_BatchMultiSigCall;
//   const chainId = this.chainId;
//   const decoded = iface.decodeFunctionData("batchMultiSigCall", calldata);

//   const arrayKeys = ["signatures", "mcall"];
//   const objectKeys = ["tr"];

//   const getFCT = (obj: object): Record<"version" | "tr" | "purgeFCT" | "investor" | "activator", any> => {
//     return Object.entries(obj).reduce((acc, [key, value]) => {
//       if (!isNaN(parseFloat(key))) {
//         return acc;
//       }

//       if (arrayKeys.includes(key)) {
//         return {
//           ...acc,
//           [key]: (value as object[]).map((sign) => getFCT(sign)),
//         };
//       }

//       if (objectKeys.includes(key)) {
//         return {
//           ...acc,
//           [key]: getFCT(value),
//         };
//       }

//       if (key === "callId" || key === "sessionId") {
//         return {
//           ...acc,
//           [key]: "0x" + value.toHexString().slice(2).padStart(64, "0"),
//         };
//       }

//       if (key === "types") {
//         return {
//           ...acc,
//           [key]: (value as BigNumber[]).map((type) => type.toString()),
//         };
//       }

//       return {
//         ...acc,
//         [key]: BigNumber.isBigNumber(value) ? value.toHexString() : value,
//       };
//     }, {} as Record<"version" | "tr" | "purgeFCT" | "investor" | "activator", any>);
//   };

//   const decodedFCT: {
//     version: string;
//     tr: Omit<IFCT, "typedData">;
//     purgeFCT: string;
//     investor: string;
//     activator: string;
//   } = getFCT(decoded);

//   const FCTOptions = SessionID.asOptions(decodedFCT.tr.sessionId);
//   this.setOptions(FCTOptions);

//   for (const [index, call] of decodedFCT.tr.mcall.entries()) {
//     try {
//       const pluginData = getPluginProvider({
//         address: call.to,
//         chainId,
//         signature: call.functionSignature,
//       });

//       if (!pluginData) {
//         throw new Error("Plugin not found");
//       }

//       const plugin = new pluginData.plugin({
//         chainId,
//       });

//       const params = plugin.methodParams;

//       const decodedParams =
//         params.length > 0
//           ? new AbiCoder().decode(
//               params.map((type) => `${type.type} ${type.name}`),
//               call.data
//             )
//           : [];

//       plugin.input.set({
//         to: call.to,
//         value: parseInt(call.value, 16).toString(),
//         methodParams: params.reduce((acc, param) => {
//           const getValue = (value: utils.Result) => {
//             const variables = ["0xfb0", "0xfa0", "0xfc00000", "0xfd00000", "0xfdb000"];
//             if (BigNumber.isBigNumber(value)) {
//               const hexString = value.toHexString();
//               if (variables.some((v) => hexString.startsWith(v))) {
//                 return hexString;
//               }

//               return value.toString();
//             }

//             return value;
//           };

//           const value = getValue((decodedParams as ethers.utils.Result)[param.name]);

//           return { ...acc, [param.name]: value };
//         }, {}),
//       });

//       const { options } = CallID.parse(call.callId);

//       const callInput = {
//         nodeId: `node${index + 1}`,
//         plugin,
//         from: call.from,
//         options: options as any,
//       };

//       await this.create(callInput);
//     } catch (e: any) {
//       if (e.message !== "Multiple plugins found for the same signature, can't determine which one to use") {
//         throw new Error(`Plugin error for call at index ${index} - ${e.message}`);
//       }
//       throw new Error(`Plugin not found for call at index ${index}`);
//     }
//   }

//   return this.calls;
// }
