"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.impFCT = exports.importFCTWithMap = exports.importFCT = exports.exportNotificationFCT = exports.exportWithPayment = exports.exportWithApprovals = exports.exportFCT = exports.exportMap = exports.getIndexByNodeId = exports.getCallByNodeId = exports.getCall = exports.createPlugin = exports.addAtIndex = exports.createMultiple = exports.create = void 0;
const fct_plugins_1 = require("@kiroboio/fct-plugins");
const eth_sig_util_1 = require("@metamask/eth-sig-util");
const ethers_1 = require("ethers");
const utils_1 = require("ethers/lib/utils");
const constants_1 = require("../../constants");
const flows_1 = require("../../constants/flows");
const variables_1 = require("../../variables");
const batchMultiSigCall_1 = require("../batchMultiSigCall");
const classes_1 = require("../classes");
const helpers_1 = require("../classes/Call/helpers");
// If F is Multicall, return multicall, else return Call
// type CreateOutput<F extends FCTInputCall> = F extends Multicall ? Multicall : Call;
async function create(call) {
    // If the input is already made Call class, we just add it to _calls.
    if (call instanceof classes_1.Call) {
        this._calls.push(call);
        return call;
    }
    // Else we create Call class from the input
    const newCall = await classes_1.Call.create({
        FCT: this,
        call,
    });
    this._calls.push(newCall);
    return newCall;
}
exports.create = create;
async function createMultiple(calls) {
    const callsCreated = [];
    for (const [index, call] of calls.entries()) {
        try {
            const createdCall = await this.create(call);
            callsCreated.push(createdCall);
        }
        catch (err) {
            if (err instanceof Error) {
                throw new Error(`Error creating call ${index + 1}: ${err.message}`);
            }
        }
    }
    return callsCreated;
}
exports.createMultiple = createMultiple;
async function addAtIndex(call, index) {
    if (index < 0 || index > this._calls.length) {
        throw new Error("Index out of range");
    }
    if (call instanceof classes_1.Call) {
        this._calls.splice(index, 0, call);
        return call;
    }
    const newCall = await classes_1.Call.create({
        FCT: this,
        call,
    });
    this._calls.splice(index, 0, newCall);
    return newCall;
}
exports.addAtIndex = addAtIndex;
function createPlugin({ plugin, initParams, }) {
    const Plugin = new plugin({
        chainId: this.chainId,
        initParams: initParams ?? {},
    });
    if (Plugin instanceof plugin) {
        return Plugin;
    }
    else {
        throw new Error(`Plugin creation failed: ${JSON.stringify(plugin)}`);
    }
}
exports.createPlugin = createPlugin;
function getCall(index) {
    if (index < 0 || index >= this._calls.length) {
        throw new Error("Index out of range");
    }
    return this._calls[index];
}
exports.getCall = getCall;
function getCallByNodeId(nodeId) {
    const call = this._calls.find((c) => c.nodeId === nodeId);
    if (!call) {
        throw new Error(`Call with nodeId ${nodeId} not found`);
    }
    return call;
}
exports.getCallByNodeId = getCallByNodeId;
function getIndexByNodeId(nodeId) {
    return this._calls.findIndex((call) => call.nodeId === nodeId);
}
exports.getIndexByNodeId = getIndexByNodeId;
function exportMap() {
    const calls = this.calls.map((call) => call.nodeId);
    const computed = this.computed.map((computed) => computed.id);
    const validations = this.validation.get().map((validation) => validation.id);
    return {
        calls,
        computed,
        validations,
    };
}
exports.exportMap = exportMap;
/**
 * Prepares FCT data to be signed on and executed on the blockchain.
 * @returns The IFCT object representing the current state of the FCT.
 * @throws Error if no calls are added to FCT.
 */
function exportFCT() {
    if (this.calls.length === 0) {
        throw new Error("No calls added to FCT");
    }
    // Check if every computed variable is used in a call
    // const computedVariables = this.computed;
    // computedVariables.forEach((computedVariable, index) => {
    //   const isUsed = this.calls.some((call) => call.isComputedUsed(computedVariable.id as string, index));
    //   if (!isUsed) {
    //     throw new Error(
    //       `Computed variable ${computedVariable.id} is not used. Make sure to remove it if the computed variable is not intended to be used.`,
    //     );
    //   }
    // });
    const typedData = new classes_1.EIP712(this).getTypedData();
    return {
        typedData,
        typeHash: (0, utils_1.hexlify)(eth_sig_util_1.TypedDataUtils.hashType(typedData.primaryType, typedData.types)),
        sessionId: new classes_1.SessionID(this).asString(),
        nameHash: (0, utils_1.id)(this.options.name),
        appHash: (0, utils_1.id)(this.options.app.name),
        appVersionHash: (0, utils_1.id)(this.options.app.version),
        builderHash: (0, utils_1.id)(this.options.builder.name),
        builderAddress: this.options.builder.address,
        domainHash: (0, utils_1.id)(this.options.domain),
        verifierHash: (0, utils_1.id)(this.options.verifier),
        mcall: this.calls.map((call, index) => call.getAsMCall(typedData, index)),
        externalSigners: this.options.multisig.externalSigners,
        signatures: [this.utils.getAuthenticatorSignature()],
        computed: this.computedAsData,
        validations: this.validation.getForData(),
        variables: [],
    };
}
exports.exportFCT = exportFCT;
async function exportWithApprovals() {
    const FCTData = this.exportFCT();
    const FCT = batchMultiSigCall_1.BatchMultiSigCall.from(FCTData);
    // Check if the FCT calls contain 2 erc20approvals and are at index 0 and last index
    const erc20Approvals = FCT.calls.filter((call, i) => {
        const getCall = call.get();
        return (getCall.method === "erc20Approvals" &&
            getCall.toENS === "@lib:multicall" &&
            (i === 0 || i === FCT.calls.length - 1));
    });
    if (erc20Approvals.length !== 2) {
        return FCTData;
    }
    const signers = FCT.utils.getSigners();
    const requiredApprovals = (await FCT.utils.getAllRequiredApprovals()).filter((approval) => approval.protocol === "ERC20");
    for (const signer of signers) {
        // Get all approvals for the signer
        const approvals = requiredApprovals.filter((approval) => approval.from.toLowerCase() === signer.toLowerCase());
        const ERC20Approvals = new fct_plugins_1.Erc20Approvals({
            chainId: FCT.chainId,
        });
        const ResetERC20Approvals = new fct_plugins_1.Erc20Approvals({
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
        await FCT.addAtIndex({
            from: signer,
            plugin: ERC20Approvals,
        }, 0);
        // Set reset approvals last
        await FCT.addAtIndex({
            from: signer,
            plugin: ResetERC20Approvals,
        }, FCT.calls.length);
    }
    return FCT.exportFCT();
}
exports.exportWithApprovals = exportWithApprovals;
async function exportWithPayment(payer) {
    const FCTData = this.exportFCT();
    const FCT = batchMultiSigCall_1.BatchMultiSigCall.from(FCTData);
    // 180_000n is the approx gas limit for the calculation
    const gasLimit = this.calls.reduce((acc, call) => acc + BigInt(call.options.gasLimit), 0n) + 180000n;
    const Multiply = new fct_plugins_1.TokensMath.getters.Multiply({
        chainId: this.chainId,
        initParams: {
            methodParams: {
                amount1: gasLimit.toString(),
                amount2: (0, variables_1.getGasPrice)(),
                decimals1: "18",
                decimals2: "18",
                decimalsOut: "18",
            },
        },
    });
    const call = await FCT.add({
        plugin: Multiply,
        from: payer,
    });
    const WETH = new fct_plugins_1.ERC20.actions.Transfer({
        chainId: this.chainId,
        initParams: {
            to: constants_1.addresses[+this.chainId].WETH,
            methodParams: {
                amount: Multiply.output.params.result.getOutputVariable(call.nodeId),
                recipient: (0, variables_1.getActivatorAddress)(),
            },
        },
    });
    await FCT.add({
        plugin: WETH,
        from: payer,
    });
    return FCT.export();
}
exports.exportWithPayment = exportWithPayment;
function exportNotificationFCT() {
    const fctOptions = this.options;
    this.setOptions({
        dryRun: true,
        maxGasPrice: "0",
    });
    const callOptionsBefore = [];
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
exports.exportNotificationFCT = exportNotificationFCT;
function importFCT(fct) {
    return impFCT.call(this, fct);
}
exports.importFCT = importFCT;
function importFCTWithMap(fct, map) {
    return impFCT.call(this, fct, map);
}
exports.importFCTWithMap = importFCTWithMap;
function impFCT(fct, map) {
    const typedData = fct.typedData;
    const domain = typedData.domain;
    const { meta, engine } = typedData.message;
    this.batchMultiSigSelector = engine.selector;
    this.version = engine.version;
    this.chainId = domain.chainId.toString();
    this.domain = domain;
    this.randomId = engine.random_id.slice(2);
    const sessionIDOptions = classes_1.SessionID.asOptions(fct.sessionId);
    const options = {
        id: "",
        ...classes_1.SessionID.asOptions(fct.sessionId),
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
    this._setOptionsWithoutValidation(options);
    const { types: typesObject } = typedData;
    for (const [index, call] of fct.mcall.entries()) {
        // Slice the first element because it is the call type
        const dataTypes = [...typedData.types[`transaction${index + 1}`]].slice(1);
        const { call: meta, ...parameters } = typedData.message[`transaction_${index + 1}`];
        let params = [];
        if (dataTypes.length > 0) {
            const signature = meta.method_interface;
            const functionName = signature.split("(")[0];
            const iface = new ethers_1.ethers.utils.Interface([`function ${signature}`]);
            const ifaceFunction = iface.getFunction(functionName);
            const inputs = ifaceFunction.inputs;
            params = (0, helpers_1.getParamsFromTypedData)({
                coreParamTypes: inputs,
                parameters,
                types: typesObject,
                primaryType: `transaction${index + 1}`,
            });
        }
        const getFlow = () => {
            const flow = Object.entries(flows_1.flows).find(([, value]) => {
                return value.text === meta.flow_control.toString();
            });
            if (!flow) {
                throw new Error("Flow control not found");
            }
            return constants_1.Flow[flow[0]];
        };
        const callIndex = index + 1;
        const callInput = {
            nodeId: map?.calls[index] ?? `node${callIndex}`,
            to: call.to,
            from: call.from,
            value: call.value,
            method: meta.method_interface.split("(")[0],
            params,
            toENS: meta.to_ens,
            options: {
                gasLimit: meta.gas_limit,
                jumpOnSuccess: meta.jump_on_success === 0
                    ? ""
                    : map?.calls[callIndex + meta.jump_on_success] ?? `node${callIndex + 1 + meta.jump_on_success}`,
                jumpOnFail: meta.jump_on_fail === 0
                    ? ""
                    : map?.calls[callIndex + meta.jump_on_fail] ?? `node${callIndex + 1 + meta.jump_on_fail}`,
                flow: getFlow(),
                callType: constants_1.CALL_TYPE_MSG_REV[meta.call_type],
                falseMeansFail: meta.returned_false_means_fail,
                permissions: meta.permissions.toString(),
                payerIndex: meta.payer_index,
                validation: meta.validation === 0 ? "" : map?.validations[meta.validation - 1] ?? meta.validation.toString(),
                usePureMethod: meta.method_interface.includes("(") ? false : true,
            },
        };
        const callClass = new classes_1.Call({
            FCT: this,
            isImport: true,
            input: callInput,
        });
        this._calls.push(callClass);
    }
    // Get all computed variables names
    const computedVariableNames = typedData.types.BatchMultiSigCall.filter((val) => val.type === "Computed").map((val) => val.name);
    // Get all computed variables from typedData.message
    const computedVariables = computedVariableNames.map((name) => typedData.message[name]);
    for (const computedVariable of computedVariables) {
        this.addComputed({
            // id: computedVariable.index,
            id: map?.computed[+computedVariable.index - 1] ?? computedVariable.index,
            value1: (0, helpers_1.manageValue)(computedVariable.value_1),
            operator1: computedVariable.op_1,
            value2: (0, helpers_1.manageValue)(computedVariable.value_2),
            operator2: computedVariable.op_2,
            value3: (0, helpers_1.manageValue)(computedVariable.value_3),
            operator3: computedVariable.op_3,
            value4: (0, helpers_1.manageValue)(computedVariable.value_4),
            overflowProtection: computedVariable.overflow_protection,
        });
    }
    const validationVariableNames = typedData.types.BatchMultiSigCall.filter((val) => val.type === "Validation").map((val) => val.name);
    const validaitonVariables = validationVariableNames.map((name) => typedData.message[name]);
    for (const validationVariable of validaitonVariables) {
        this.validation.addValidation({
            // id: validationVariable.index,
            id: map?.validations[+validationVariable.index - 1] ?? validationVariable.index,
            value1: validationVariable.value_1,
            operator: validationVariable.op,
            value2: validationVariable.value_2,
        });
    }
    return this.calls;
}
exports.impFCT = impFCT;
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
//# sourceMappingURL=FCT.js.map