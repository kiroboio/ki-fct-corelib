import { getPlugin, Multicall } from "@kiroboio/fct-plugins";
import { TypedDataUtils } from "@metamask/eth-sig-util";
import { hexlify, id } from "ethers/lib/utils";
import { CALL_TYPE_MSG, EMPTY_HASH } from "../../../constants";
import { flows } from "../../../constants/flows";
import { InstanceOf } from "../../../helpers";
import { deepMerge } from "../../../helpers/deepMerge";
import { isComputedVariable, isExternalVariable } from "../../../variables";
import { NO_JUMP } from "../../constants";
import { CallID } from "../CallID";
import { CallBase } from "./CallBase";
import { generateNodeId, getAllSimpleParams, getParams } from "./helpers";
import { getCallGasLimit } from "./helpers/callGas";
import { decodeFromData, decodeOutputData, getEncodedMethodParams } from "./helpers/callParams";
import { verifyCall } from "./helpers/verifyCall";
export class Call extends CallBase {
    FCT;
    plugin;
    isImport;
    constructor({ FCT, input, isImport, plugin, }) {
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
    update(call) {
        const data = deepMerge(this._call, call);
        // Verify the call
        this._verifyCall({ call: data, update: true });
        this._call = data;
        return this.get();
    }
    addValidation(validation) {
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
    get options() {
        const defaults = { ...this.FCT.callDefault.options };
        return deepMerge(defaults, this.call.options);
    }
    isComputedUsed(id, index) {
        // Computed Variable can be used as value, to, from, param values.
        // We need to check all of them
        const call = this.get();
        const checks = [call.value, call.from, call.to, ...getAllSimpleParams(call.params || [])];
        return checks.some((item) => {
            return isComputedVariable({
                strict: true,
                value: item,
                id,
                index,
            });
        });
    }
    isExternalVariableUsed() {
        const call = this.get();
        const checks = [call.value, call.from, call.to, ...getAllSimpleParams(call.params || [])];
        return checks.some(isExternalVariable);
    }
    get() {
        const payerIndex = this.FCT.getIndexByNodeId(this.call.nodeId);
        const callDefaults = { ...this.FCT.callDefault };
        const data = deepMerge(callDefaults, { options: { payerIndex: payerIndex + 1 } }, this.call);
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
    getDecoded() {
        const params = this.get().params;
        if (params && params.length > 0) {
            const parameters = this._decodeParams(params);
            return { ...this.get(), params: parameters };
        }
        return {
            ...this.get(),
            params: [],
        };
    }
    getAsMCall(typedData, index) {
        const call = this.get();
        return {
            typeHash: hexlify(TypedDataUtils.hashType(`transaction${index + 1}`, typedData.types)),
            ensHash: call.toENS ? id(call.toENS) : EMPTY_HASH,
            functionSignature: this.getFunctionSignature(),
            value: this.FCT.variables.getValue(call.value, "uint256", "0"),
            callId: CallID.asString({
                calls: this.FCT.calls,
                validation: this.FCT.validation,
                call,
                index,
                payerIndex: this.options.payerIndex,
            }),
            from: this.FCT.variables.getValue(call.from, "address"),
            to: this.FCT.variables.getValue(call.to, "address"),
            data: this.getEncodedData(),
            types: this.getTypesArray(),
            typedHashes: this.getTypedHashes(index),
        };
    }
    getAsEfficientMCall(index) {
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
    generateEIP712Type(index) {
        const call = this.get();
        if (!call.params || (call.params && call.params.length === 0)) {
            return {
                structTypes: {},
                callType: [{ name: "call", type: "Call" }],
            };
        }
        const structTypes = {};
        const callParameters = call.params.map((param) => {
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
    generateEIP712Message(index) {
        const paramsData = this._getParamsEIP712();
        const call = this.get();
        const options = call.options;
        const flow = flows[options.flow].text;
        const { jumpOnSuccess, jumpOnFail } = this._getJumps(index);
        return {
            call: {
                call_index: index + 1,
                payer_index: typeof call.options.payerIndex === "number" ? call.options.payerIndex : index + 1,
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
    getTypedHashes(index) {
        const { structTypes, callType } = this.generateEIP712Type(index);
        return this._getUsedStructTypes(structTypes, callType.slice(1)).map((type) => {
            return hexlify(TypedDataUtils.hashType(type, structTypes));
        });
    }
    getEncodedData() {
        return getEncodedMethodParams(this.getDecoded());
    }
    getEncodedDataWithSignature() {
        const funcSigAsBytes4 = this.getFunctionSignature().slice(0, 10);
        const encodedData = this.getEncodedData().replace(/^0x/, "");
        return funcSigAsBytes4 + encodedData;
    }
    decodeData({ inputData, outputData }) {
        const res = {};
        res.inputData = decodeFromData(this.getDecoded(), inputData);
        if (outputData) {
            const to = this.get().to;
            const pluginData = getPlugin({
                signature: this.getFunctionSignature(),
                address: typeof to === "string" ? to : "",
                chainId: this.FCT.chainId,
            });
            if (!pluginData)
                return null;
            let plugin;
            if (pluginData instanceof Multicall) {
                plugin = pluginData;
                plugin.setMethodParams(res.inputData);
            }
            else {
                // @ts-ignore
                plugin = new pluginData.plugin({
                    walletAddress: "0x",
                    chainId: this.FCT.chainId,
                });
            }
            res.outputData = decodeOutputData(plugin, outputData);
        }
        else {
            res.outputData = [];
        }
        return res;
    }
    decodeOutputData(data) {
        if (this.plugin) {
            return decodeOutputData(this.plugin, data);
        }
        const to = this.get().to;
        const pluginData = getPlugin({
            signature: this.getFunctionSignature(),
            address: typeof to === "string" ? to : "",
            chainId: this.FCT.chainId,
        });
        if (!pluginData)
            return null;
        return decodeOutputData(
        // @ts-ignore
        new pluginData.plugin({
            walletAddress: "0x",
            chainId: this.FCT.chainId,
        }), data);
    }
    //
    // Private methods
    //
    _getUsedStructTypes(typedData, mainType) {
        return mainType.reduce((acc, item) => {
            if (item.type.includes("Struct_")) {
                const type = item.type.replace("[]", "");
                return [...acc, type, ...this._getUsedStructTypes(typedData, typedData[type])];
            }
            return acc;
        }, []);
    }
    _getStructType({ param, nodeId, structTypes = {}, }) {
        if (!param.customType && !param.type.includes("tuple")) {
            return param.messageType || param.type;
        }
        let paramValue;
        if (InstanceOf.TupleArray(param.value, param)) {
            paramValue = param.value[0];
        }
        else if (InstanceOf.Tuple(param.value, param)) {
            paramValue = param.value;
        }
        else {
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
                type: item.messageType || item.type,
            };
        });
        // If param type is array, we need to add [] to the end of the type
        const typeName = `Struct_${nodeId}_${Object.keys(structTypes).length}`;
        structTypes[typeName] = generalType;
        return typeName + (param.type.includes("[]") ? "[]" : "");
    }
    _getParamsEIP712() {
        const decoded = this.getDecoded();
        return decoded.params
            ? {
                ...getParams(decoded.params),
            }
            : {};
    }
    _getJumps(index) {
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
                throw new Error(`Jump on success node id ${options.jumpOnSuccess} is current or before current node (${call.nodeId})`);
            }
            jumpOnSuccess = jumpOnSuccessIndex - index - 1;
        }
        if (options.jumpOnFail && options.jumpOnFail !== NO_JUMP) {
            const jumpOnFailIndex = this.FCT.calls.findIndex((c) => c.nodeId === options.jumpOnFail);
            if (jumpOnFailIndex === -1) {
                throw new Error(`Jump on fail node id ${options.jumpOnFail} not found`);
            }
            if (jumpOnFailIndex <= index) {
                throw new Error(`Jump on fail node id ${options.jumpOnFail} is current or before current node (${call.nodeId})`);
            }
            jumpOnFail = jumpOnFailIndex - index - 1;
        }
        return {
            jumpOnSuccess,
            jumpOnFail,
        };
    }
    _decodeParams(params) {
        return params.reduce((acc, param) => {
            if (param.type === "tuple" || param.customType) {
                if (param.type.lastIndexOf("[") > 0) {
                    const value = param.value;
                    const decodedValue = value.map((tuple) => this._decodeParams(tuple));
                    return [...acc, { ...param, value: decodedValue }];
                }
                const value = this._decodeParams(param.value);
                return [...acc, { ...param, value }];
            }
            // If param type is any of the arrays, we need to decode each item
            if (param.type.includes("[")) {
                const type = param.type.slice(0, param.type.lastIndexOf("["));
                const value = param.value;
                return [
                    ...acc,
                    {
                        ...param,
                        value: value.map((item) => {
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
            return [...acc, param];
        }, []);
    }
    _verifyCall({ call, update = false }) {
        verifyCall({
            call,
            update,
            FCT: this.FCT,
        });
    }
    static async create({ call, FCT }) {
        if (InstanceOf.CallWithPlugin(call)) {
            return await this._createWithPlugin(FCT, call);
        }
        else {
            return this._createSimpleCall(FCT, call);
        }
    }
    static async _createWithPlugin(FCT, callWithPlugin) {
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
        return new Call({ FCT, input: data, plugin: callWithPlugin.plugin });
    }
    static _createSimpleCall(FCT, call) {
        return new Call({ FCT, input: call });
    }
}
//# sourceMappingURL=Call.js.map