import { getPlugin, Multicall } from "@kiroboio/fct-plugins";
import { TypedDataUtils } from "@metamask/eth-sig-util";
import { hexlify, id } from "ethers/lib/utils";
import { CALL_TYPE, CALL_TYPE_MSG } from "../../../constants";
import { flows } from "../../../constants/flows";
import { InstanceOf } from "../../../helpers";
import { deepMerge } from "../../../helpers/deepMerge";
import { NO_JUMP } from "../../constants";
import { CallID } from "../CallID";
import { CallBase } from "./CallBase";
import { generateNodeId, getAllSimpleParams, getParams, isAddress, isInteger, verifyParam } from "./helpers";
import { getGasCosts } from "./helpers/callGas";
import { decodeFromData, decodeOutputData, getEncodedMethodParams } from "./helpers/callParams";
export class Call extends CallBase {
    FCT;
    plugin;
    isImport;
    constructor({ FCT, input, isImport, plugin, }) {
        super(input);
        this.FCT = FCT;
        this.isImport = isImport || false;
        this._verifyCall({ call: this.call });
        // Check if this is the first call, we should increase the gas limit by 40k. Else 15k
        // if (!isImport && this._call.options?.gasLimit) {
        //   if (FCT.calls.length === 0) {
        //     const fee = getFee("mcallOverheadFirstCall", FCT.chainId);
        //     this._call.options = deepMerge(this._call.options, {
        //       gasLimit: (BigInt(this._call.options?.gasLimit || 50_000) + fee).toString(),
        //     });
        //   } else {
        //     const fee = getFee("mcallOverheadOtherCalls", FCT.chainId);
        //     this._call.options = deepMerge(this._call.options, {
        //       gasLimit: (BigInt(this._call.options?.gasLimit || 50_000) + fee).toString(),
        //     });
        //   }
        // }
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
            if (InstanceOf.Variable(item)) {
                return item.id === id;
            }
            if (typeof item === "string" && (item.length === 42 || item.length === 66)) {
                // If it is a string, it can be a variable as string instead of object type
                const hexString = item.toLowerCase();
                if (hexString.startsWith("0xfe000")) {
                    const parsedIndex = parseInt(hexString.slice(-4), 16).toString();
                    return parsedIndex === (index + 1).toString();
                }
            }
            return false;
        });
    }
    get() {
        const payerIndex = this.FCT.getIndexByNodeId(this.call.nodeId);
        const callDefaults = { ...this.FCT.callDefault };
        const data = deepMerge(callDefaults, { options: { payerIndex: payerIndex + 1 } }, this.call);
        if (!this.isImport && data.options.gasLimit && data.options.gasLimit !== "0") {
            // This is the flow:
            // 1. Check if it is the first call
            // 2. Check if the call is delegate call:
            //   2.1 If it is - delegateCall_firstOverhead
            //   2.2 If it is not:
            //     2.2.1 Check if there was already delegate call - delegateCall_repeatOverhead
            //     2.2.2 If there was not - delegateCall_otherOverhead
            // 3. Check if the call is static call:
            //  3.1 If it is - staticCall_firstOverhead
            //  3.2 If it is not - staticCall_otherOverhead
            // 4. This is a regular call
            //  4.1 If it is first call - call_firstOverhead
            //  4.2 If it is not - call_otherOverhead
            //  4.3 If it is a call with ETH - add nativeTokenOverhead
            //
            const isFirstCall = payerIndex === 0;
            const callType = data.options.callType;
            let newGasLimit;
            if (callType === "LIBRARY" || callType === "LIBRARY_VIEW_ONLY") {
                if (isFirstCall) {
                    newGasLimit = (BigInt(data.options.gasLimit) + getGasCosts("delegateCall_firstOverhead", this.FCT.chainId)).toString();
                }
                else {
                    const hadDelegateCall = this.FCT.calls.slice(0, payerIndex).some((call) => {
                        return call.options.callType === "LIBRARY" || call.options.callType === "LIBRARY_VIEW_ONLY";
                    });
                    if (hadDelegateCall) {
                        newGasLimit = (BigInt(data.options.gasLimit) + getGasCosts("delegateCall_repeatOverhead", this.FCT.chainId)).toString();
                    }
                    else {
                        newGasLimit = (BigInt(data.options.gasLimit) + getGasCosts("delegateCall_otherOverhead", this.FCT.chainId)).toString();
                    }
                }
            }
            // Means that it is either regular call or staticcall
            if (isFirstCall) {
                newGasLimit = (BigInt(data.options.gasLimit) + getGasCosts("call_firstOverhead", this.FCT.chainId)).toString();
            }
            else {
                newGasLimit = (BigInt(data.options.gasLimit) + getGasCosts("call_otherOverhead", this.FCT.chainId)).toString();
            }
            if (callType === "ACTION" && data.value && data.value !== "0") {
                newGasLimit = (BigInt(newGasLimit) + getGasCosts("nativeTokenOverhead", this.FCT.chainId)).toString();
            }
            data.options.gasLimit = newGasLimit;
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
            ensHash: id(call.toENS || ""),
            functionSignature: this.getFunctionSignature(),
            value: this.FCT.variables.getValue(call.value, "uint256", "0"),
            callId: CallID.asString({
                calls: this.FCT.callsAsObjects,
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
                calls: this.FCT.callsAsObjects,
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
        // return decodeFromData(this.getDecoded(), inputData);
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
        // if (pluginData instanceof Multicall) {
        //   const plugin = pluginData;
        // }
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
        // To address validator
        if (!call.to) {
            throw new Error("To address is required");
        }
        else if (typeof call.to === "string") {
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
            let index;
            if (update) {
                // If it is an update, we need to ignore the current node ID
                const currentCallIndex = this.FCT.getIndexByNodeId(this.nodeId);
                // Ignore the current node ID from this.calls;
                const calls = this.FCT.calls.filter((item, i) => i !== currentCallIndex);
                index = calls.findIndex((item) => item.nodeId === call.nodeId);
            }
            else {
                index = this.FCT.calls.findIndex((item) => item.nodeId === call.nodeId);
            }
            if (index > -1) {
                throw new Error(`Node ID ${call.nodeId} already exists, please use a different one`);
            }
        }
        // Options validator
        if (call.options) {
            const { gasLimit, callType, flow } = call.options;
            if (gasLimit) {
                isInteger(gasLimit, "Gas limit");
            }
            if (callType) {
                const keysOfCALLTYPE = Object.keys(CALL_TYPE);
                if (!keysOfCALLTYPE.includes(callType)) {
                    throw new Error(`Call type ${callType} is not valid`);
                }
            }
            if (flow) {
                const keysOfFlow = Object.keys(flows);
                if (!keysOfFlow.includes(flow)) {
                    throw new Error(`Flow ${flow} is not valid`);
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