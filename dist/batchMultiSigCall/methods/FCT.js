"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setCallDefaults = exports.importEncodedFCT = exports.importFCT = exports.exportFCT = exports.getCall = exports.createPlugin = exports.createMultiple = exports.create = exports.generateNodeId = void 0;
const ki_eth_fct_provider_ts_1 = require("@kirobo/ki-eth-fct-provider-ts");
const ethers_1 = require("ethers");
const utils_1 = require("ethers/lib/utils");
const FCT_BatchMultiSigCall_abi_json_1 = __importDefault(require("../../abi/FCT_BatchMultiSigCall.abi.json"));
const constants_1 = require("../../constants");
const classes_1 = require("../classes");
const helpers_1 = require("../helpers");
// Generate nodeId for a call
function generateNodeId() {
    return [...Array(20)].map(() => Math.floor(Math.random() * 16).toString(16)).join("");
}
exports.generateNodeId = generateNodeId;
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
    return this._calls.get();
}
exports.createMultiple = createMultiple;
function createPlugin(Plugin) {
    return new Plugin({
        chainId: this.chainId,
    });
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
    // Here we import FCT and add all the data inside BatchMultiSigCall
    const options = (0, helpers_1.parseSessionID)(fct.sessionId, fct.builder, fct.externalSigners);
    this.setOptions(options);
    const typedData = fct.typedData;
    const { types: typesObject } = typedData;
    for (const [index, call] of fct.mcall.entries()) {
        const dataTypes = typedData.types[`transaction${index + 1}`].slice(1);
        const { call: meta } = typedData.message[`transaction_${index + 1}`];
        let params = [];
        if (dataTypes.length > 0) {
            const signature = meta.method_interface;
            const functionName = signature.split("(")[0];
            const iface = new ethers_1.ethers.utils.Interface([`function ${signature}`]);
            const ifaceFunction = iface.getFunction(functionName);
            const inputs = ifaceFunction.inputs;
            //Create a functions that goes through all the inputs and adds the name of the parameter
            const addNameToParameter = (inputs, dataTypes) => {
                return inputs.map((input, index) => {
                    const dataType = dataTypes[index];
                    if (input.type.includes("tuple")) {
                        const data = {
                            ...input,
                            name: dataType.name,
                            components: addNameToParameter(input.components, typesObject[dataType.type]),
                        };
                        return utils_1.ParamType.from(data);
                    }
                    return utils_1.ParamType.from({
                        ...input,
                        name: dataType.name,
                    });
                });
            };
            const functionSignatureHash = ethers_1.ethers.utils.id(signature);
            const updatedInputs = addNameToParameter(inputs, dataTypes);
            const encodedDataWithSignatureHash = functionSignatureHash.slice(0, 10) + call.data.slice(2);
            const decodedResult = iface.decodeFunctionData(functionName, encodedDataWithSignatureHash);
            params = (0, classes_1.getParamsFromInputs)(updatedInputs, decodedResult);
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
            },
        };
        this.create(callInput);
    }
    return this.calls;
}
exports.importFCT = importFCT;
async function importEncodedFCT(calldata) {
    const ABI = FCT_BatchMultiSigCall_abi_json_1.default;
    const iface = new ethers_1.utils.Interface(ABI);
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
    const FCTOptions = (0, helpers_1.parseSessionID)(decodedFCT.tr.sessionId, decodedFCT.tr.builder);
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
            const { options } = (0, helpers_1.parseCallID)(call.callId);
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
function setCallDefaults(callDefault) {
    return this._calls.setCallDefaults(callDefault);
}
exports.setCallDefaults = setCallDefaults;
