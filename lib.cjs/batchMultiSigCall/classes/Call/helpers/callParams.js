"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeOutputData = exports.decodeFromData = exports.getEncodedMethodParams = exports.getMethodInterface = void 0;
const fct_plugins_1 = require("@kiroboio/fct-plugins");
const ethers_1 = require("ethers");
const utils_1 = require("ethers/lib/utils");
const helpers_1 = require("../../../../helpers");
const params_1 = require("./params");
function manage(val) {
    // If the value is not an array
    if (!Array.isArray(val)) {
        return (0, params_1.manageValue)(val);
    }
    // If the value is an array
    return val.map(manage);
}
const buildInputsFromParams = (params) => {
    return params.map((param) => {
        if (helpers_1.InstanceOf.Param(param.value)) {
            return { type: "tuple", name: param.name, components: buildInputsFromParams(param.value) };
        }
        else if (helpers_1.InstanceOf.ParamArray(param.value)) {
            return { type: "tuple[]", name: param.name, components: buildInputsFromParams(param.value[0]) };
        }
        return { type: param.type, name: param.name };
    });
};
// From method and params create tuple
// This version creates a ABI and gets the interface from it in ethers and then encodes the function bytes4
const getMethodInterface = (call) => {
    if (!call.method)
        return "";
    const ABI = [
        {
            name: call.method,
            type: "function",
            constant: false,
            payable: false,
            inputs: buildInputsFromParams(call.params || []),
            outputs: [],
        },
    ];
    return new ethers_1.utils.Interface(ABI).getFunction(call.method).format();
};
exports.getMethodInterface = getMethodInterface;
const getEncodedMethodParams = (call) => {
    if (!call.method || !call.params)
        return "0x";
    return utils_1.defaultAbiCoder.encode(call.params.map(_getTypeForEncodedMethodParams), call.params.map(_getValuesForEncodedMethodParams));
};
exports.getEncodedMethodParams = getEncodedMethodParams;
const decodeFromData = (call, data) => {
    if (!call.method)
        return undefined;
    const ABI = [
        {
            name: call.method,
            type: "function",
            constant: false,
            payable: false,
            inputs: buildInputsFromParams(call.params || []),
            outputs: [],
        },
    ];
    const decodedData = new ethers_1.utils.Interface(ABI).decodeFunctionData(call.method, data);
    return decodedData.slice(0, data.length).map(manage);
};
exports.decodeFromData = decodeFromData;
const decodeOutputData = (plugin, data) => {
    if (!plugin)
        return null;
    if (plugin instanceof fct_plugins_1.Multicall) {
        // If the plugin method is multiCall, we handle it differently
        if (plugin.method === "multiCall") {
            // the returned types from plugin.getOutputParamsTypes() is a bit different so we have to
            // handle it differently. plugin.getOutputParamsTypes() returns string[][][]
            return [];
        }
        const outputTypes = plugin.getOutputParamsTypes();
        const outputParams = utils_1.defaultAbiCoder.decode(outputTypes, data).map(manage);
        return outputParams;
    }
    const outputTypes = plugin.output.paramsList.map(({ param }) => param.fctType);
    return utils_1.defaultAbiCoder.decode(outputTypes, data).map(manage);
};
exports.decodeOutputData = decodeOutputData;
function _handleTypeConversion(param) {
    // If messageType is the same as type, no need for conversion
    if (param.messageType === param.type)
        return param.value;
    const conversion = typeConversions[`${param.messageType}_${param.type}`];
    if (conversion)
        return conversion(param.value);
    throw new Error(`Param ${param.name} - Conversion from ${param.messageType} to ${param.type} is not supported`);
}
// This function is used to convert the value to the correct type
// `${messageType}_${type}`: (value: string) => any
const typeConversions = {
    ["string_bytes32"]: (value) => ethers_1.utils.keccak256(ethers_1.utils.toUtf8Bytes(value)),
    ["string_bytes"]: (value) => ethers_1.utils.toUtf8Bytes(value),
};
const _getTypeForEncodedMethodParams = (param) => {
    if (param.customType || param.type.includes("tuple")) {
        let value;
        let isArray = false;
        if (param.type.lastIndexOf("[") > 0) {
            isArray = true;
            value = param.value[0];
        }
        else {
            value = param.value;
        }
        return `(${value.map(_getTypeForEncodedMethodParams).join(",")})${isArray ? "[]" : ""}`;
    }
    return param.type;
};
const _getValuesForEncodedMethodParams = (param) => {
    if (!param.value) {
        throw new Error("Param value is required");
    }
    if (param.customType || param.type.includes("tuple")) {
        let value;
        if (param.type.lastIndexOf("[") > 0) {
            value = param.value;
            return value.reduce((acc, val) => {
                return [...acc, val.map(_getValuesForEncodedMethodParams)];
            }, []);
        }
        else {
            value = param.value;
            return value.map(_getValuesForEncodedMethodParams);
        }
    }
    if (param.messageType) {
        // TODO: Here we need to add the logic for type conversion
        // If message type is defined, we need to convert value. Value is always a `messageType`
        return _handleTypeConversion(param);
    }
    return param.value;
};
//# sourceMappingURL=callParams.js.map