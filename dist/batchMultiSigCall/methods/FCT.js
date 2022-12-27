"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.importEncodedFCT = exports.importFCT = exports.exportFCT = exports.getCall = exports.createMultiple = exports.create = void 0;
const ki_eth_fct_provider_ts_1 = require("@kirobo/ki-eth-fct-provider-ts");
const eth_sig_util_1 = require("@metamask/eth-sig-util");
const ethers_1 = require("ethers");
const utils_1 = require("ethers/lib/utils");
const FCT_BatchMultiSigCall_abi_json_1 = __importDefault(require("../../abi/FCT_BatchMultiSigCall.abi.json"));
const constants_1 = require("../../constants");
const helpers_1 = require("../helpers");
async function create(callInput) {
    let call;
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
    }
    else {
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
exports.create = create;
async function createMultiple(calls) {
    for (const call of calls) {
        await this.create(call);
    }
    return this.calls;
}
exports.createMultiple = createMultiple;
function getCall(index) {
    return this.calls[index];
}
exports.getCall = getCall;
async function exportFCT() {
    this.computedVariables = [];
    if (this.calls.length === 0) {
        throw new Error("No calls added");
    }
    if (this.options.builder) {
        ethers_1.utils.isAddress(this.options.builder);
    }
    const salt = [...Array(6)].map(() => Math.floor(Math.random() * 16).toString(16)).join("");
    const version = "0x010101";
    const typedData = await this.createTypedData(salt, version);
    const sessionId = (0, helpers_1.getSessionId)(salt, this.options);
    const mcall = this.calls.map((call, index) => {
        const usedTypeStructs = (0, helpers_1.getUsedStructTypes)(typedData, `transaction${index + 1}`);
        return {
            typeHash: ethers_1.utils.hexlify(eth_sig_util_1.TypedDataUtils.hashType(`transaction${index + 1}`, typedData.types)),
            ensHash: (0, helpers_1.handleEnsHash)(call),
            functionSignature: (0, helpers_1.handleFunctionSignature)(call),
            value: this.handleValue(call),
            callId: (0, helpers_1.manageCallId)(this.calls, call, index),
            from: typeof call.from === "string" ? call.from : this.getVariable(call.from, "address"),
            to: this.handleTo(call),
            data: (0, helpers_1.handleData)(call),
            types: (0, helpers_1.handleTypes)(call),
            typedHashes: usedTypeStructs.length > 0
                ? usedTypeStructs.map((hash) => ethers_1.utils.hexlify(eth_sig_util_1.TypedDataUtils.hashType(hash, typedData.types)))
                : [],
        };
    });
    return {
        typedData,
        builder: this.options.builder || "0x0000000000000000000000000000000000000000",
        typeHash: ethers_1.utils.hexlify(eth_sig_util_1.TypedDataUtils.hashType(typedData.primaryType, typedData.types)),
        sessionId,
        nameHash: ethers_1.utils.id(this.options.name || ""),
        mcall,
        variables: [],
        externalSigners: [],
        computed: this.computedVariables,
    };
}
exports.exportFCT = exportFCT;
function importFCT(fct) {
    // Here we import FCT and add all the data inside BatchMultiSigCall
    const options = (0, helpers_1.parseSessionID)(fct.sessionId, fct.builder);
    this.setOptions(options);
    const typedData = fct.typedData;
    for (const [index, call] of fct.mcall.entries()) {
        const dataTypes = typedData.types[`transaction${index + 1}`].slice(1);
        const { call: meta } = typedData.message[`transaction_${index + 1}`];
        const decodedParams = new utils_1.AbiCoder().decode(dataTypes.map((type) => `${type.type} ${type.name}`), call.data);
        const params = dataTypes.map((t) => ({
            name: t.name,
            type: t.type,
            value: ethers_1.BigNumber.isBigNumber(decodedParams[t.name]) ? decodedParams[t.name].toString() : decodedParams[t.name],
        }));
        const getFlow = () => {
            const flow = Object.entries(constants_1.flows).find(([, value]) => {
                return value.text === meta.flow_control.toString();
            });
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
exports.importFCT = importFCT;
async function importEncodedFCT(calldata) {
    const ABI = FCT_BatchMultiSigCall_abi_json_1.default;
    const iface = new ethers_1.utils.Interface(ABI);
    let chainId;
    if (this.chainId) {
        chainId = this.chainId.toString();
    }
    else {
        const data = await this.provider.getNetwork();
        chainId = data.chainId.toString();
    }
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
                options,
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