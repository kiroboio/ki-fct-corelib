"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.importEncodedFCT = exports.importFCT = exports.exportFCT = exports.getCall = exports.createPlugin = exports.createMultiple = exports.create = void 0;
const ki_eth_fct_provider_ts_1 = require("@kirobo/ki-eth-fct-provider-ts");
const ethers_1 = require("ethers");
const utils_1 = require("ethers/lib/utils");
const constants_1 = require("../../constants");
const Interfaces_1 = require("../../helpers/Interfaces");
const classes_1 = require("../classes");
async function create(call) {
    return this._calls.create(call);
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
function createPlugin(Plugin) {
    const plugin = new Plugin({
        chainId: this.chainId,
    });
    if (plugin instanceof Plugin) {
        return plugin;
    }
    else {
        throw new Error(`Plugin creation failed: ${JSON.stringify(plugin)}`);
    }
}
exports.createPlugin = createPlugin;
function getCall(index) {
    if (index < 0 || index >= this.calls.length) {
        throw new Error("Index out of range");
    }
    return this.calls[index];
}
exports.getCall = getCall;
function exportFCT() {
    return new classes_1.ExportFCT(this).get();
}
exports.exportFCT = exportFCT;
function importFCT(fct) {
    const typedData = fct.typedData;
    const domain = typedData.domain;
    const { meta } = typedData.message;
    this.batchMultiSigSelector = meta.selector;
    this.version = meta.version;
    this.chainId = domain.chainId.toString();
    this.domain = domain;
    this.randomId = meta.random_id.slice(2);
    this.setOptions(classes_1.SessionID.asOptions({
        sessionId: fct.sessionId,
        builder: fct.builder,
        externalSigners: fct.externalSigners,
        name: typedData.message.meta.name,
    }));
    const { types: typesObject } = typedData;
    for (const [index, call] of fct.mcall.entries()) {
        const dataTypes = [...typedData.types[`transaction${index + 1}`]].slice(1);
        const { call: meta, ...parameters } = typedData.message[`transaction_${index + 1}`];
        let params = [];
        if (dataTypes.length > 0) {
            const signature = meta.method_interface;
            const functionName = signature.split("(")[0];
            const iface = new ethers_1.ethers.utils.Interface([`function ${signature}`]);
            const ifaceFunction = iface.getFunction(functionName);
            const inputs = ifaceFunction.inputs;
            params = classes_1.FCTCalls.helpers.getParamsFromTypedData({
                methodInterfaceParams: inputs,
                parameters,
                types: typesObject,
                primaryType: `transaction${index + 1}`,
            });
            // console.log(
            //   FCTCalls.helpers.getParamsFromTypedData({
            //     eip712InputTypes: inputs,
            //     parameters,
            //     types: typesObject,
            //     primaryType: `transaction${index + 1}`,
            //   })
            // );
            // const generateParamTypes = (types: TypedDataTypes, primaryType: string) => {
            //   const type = types[primaryType];
            //   // If the type[0] name is call and type is Call, then slice the first element
            //   if (type[0].name === "call" && type[0].type === "Call") {
            //     type.shift();
            //   }
            //   const params: ParamType[] = [];
            //   for (const { name, type: paramType } of type) {
            //     if (types[paramType]) {
            //       const components = generateParamTypes(types, paramType);
            //       params.push(ParamType.from({ name, type: paramType, components }));
            //     } else {
            //       params.push(ParamType.from({ name, type: paramType }));
            //     }
            //   }
            //   return params;
            // };
            // // Create a functions that goes through all the inputs and adds the name of the parameter
            // const addNameToParameter = (
            //   inputs: ethers.utils.ParamType[],
            //   dataTypes: { name: string; type: string }[]
            // ): ParamType[] => {
            //   return inputs.map((input, index) => {
            //     const dataType = dataTypes[index];
            //     if (input.type.includes("tuple")) {
            //       const data = {
            //         ...input,
            //         name: dataType.name,
            //         components: addNameToParameter(input.components, typesObject[dataType.type as keyof typeof typesObject]),
            //       };
            //       return ParamType.from(data);
            //     }
            //     return ParamType.from({
            //       ...input,
            //       name: dataType.name,
            //       type: dataType.type,
            //     });
            //   });
            // };
            // const functionSignatureHash = ethers.utils.id(signature);
            // const updatedInputs = addNameToParameter(inputs, dataTypes);
            // const encodedDataWithSignatureHash = functionSignatureHash.slice(0, 10) + call.data.slice(2);
            // const decodedResult = iface.decodeFunctionData(functionName, encodedDataWithSignatureHash);
            // params = FCTCalls.helpers.getParamsFromInputs(updatedInputs, decodedResult);
        }
        const getFlow = () => {
            const flow = Object.entries(constants_1.flows).find(([, value]) => {
                return value.text === meta.flow_control.toString();
            });
            if (!flow) {
                throw new Error("Flow control not found");
            }
            return constants_1.Flow[flow[0]];
        };
        const callInput = {
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
                callType: constants_1.CALL_TYPE_MSG_REV[meta.call_type],
                falseMeansFail: meta.returned_false_means_fail,
                permissions: meta.permissions.toString(),
            },
        };
        this.create(callInput);
    }
    return this.calls;
}
exports.importFCT = importFCT;
async function importEncodedFCT(calldata) {
    const iface = Interfaces_1.Interface.FCT_BatchMultiSigCall;
    const chainId = this.chainId;
    const decoded = iface.decodeFunctionData("batchMultiSigCall", calldata);
    const arrayKeys = ["signatures", "mcall"];
    const objectKeys = ["tr"];
    const getFCT = (obj) => {
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
                [key]: ethers_1.BigNumber.isBigNumber(value) ? value.toHexString() : value,
            };
        }, {});
    };
    const decodedFCT = getFCT(decoded);
    const FCTOptions = classes_1.SessionID.asOptions({
        sessionId: decodedFCT.tr.sessionId,
        builder: decodedFCT.tr.builder,
        name: "",
        externalSigners: decodedFCT.tr.externalSigners,
    });
    this.setOptions(FCTOptions);
    for (const [index, call] of decodedFCT.tr.mcall.entries()) {
        try {
            const pluginData = (0, ki_eth_fct_provider_ts_1.getPlugin)({
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
            const decodedParams = params.length > 0
                ? new utils_1.AbiCoder().decode(params.map((type) => `${type.type} ${type.name}`), call.data)
                : [];
            plugin.input.set({
                to: call.to,
                value: parseInt(call.value, 16).toString(),
                methodParams: params.reduce((acc, param) => {
                    const getValue = (value) => {
                        const variables = ["0xfb0", "0xfa0", "0xfc00000", "0xfd00000", "0xfdb000"];
                        if (ethers_1.BigNumber.isBigNumber(value)) {
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
            const { options } = classes_1.CallID.parse(call.callId);
            const callInput = {
                nodeId: `node${index + 1}`,
                plugin,
                from: call.from,
                options: options,
            };
            await this.create(callInput);
        }
        catch (e) {
            if (e.message !== "Multiple plugins found for the same signature, can't determine which one to use") {
                throw new Error(`Plugin error for call at index ${index} - ${e.message}`);
            }
            throw new Error(`Plugin not found for call at index ${index}`);
        }
    }
    return this.calls;
}
exports.importEncodedFCT = importEncodedFCT;
