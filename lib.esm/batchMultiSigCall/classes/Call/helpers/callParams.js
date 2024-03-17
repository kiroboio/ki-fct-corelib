import { Multicall } from "@kiroboio/fct-plugins";
import { utils } from "ethers";
import { defaultAbiCoder } from "ethers/lib/utils";
import { InstanceOf } from "../../../../helpers";
import { manageValue } from "./params";
function manage(val) {
    // If the value is not an array
    if (!Array.isArray(val)) {
        return manageValue(val);
    }
    // If the value is an array
    return val.map(manage);
}
const buildInputsFromParams = (params) => {
    return params.map((param) => {
        if (InstanceOf.Param(param.value)) {
            return { type: "tuple", name: param.name, components: buildInputsFromParams(param.value) };
        }
        else if (InstanceOf.ParamArray(param.value)) {
            return { type: "tuple[]", name: param.name, components: buildInputsFromParams(param.value[0]) };
        }
        return { type: param.type, name: param.name };
    });
};
// From method and params create tuple
// This version creates a ABI and gets the interface from it in ethers and then encodes the function bytes4
export const getMethodInterface = (call) => {
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
    return new utils.Interface(ABI).getFunction(call.method).format();
};
export const getEncodedMethodParams = (call) => {
    if (!call.method)
        return "0x";
    const getType = (param) => {
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
            return `(${value.map(getType).join(",")})${isArray ? "[]" : ""}`;
        }
        return param.type;
    };
    const getValues = (param) => {
        if (!param.value) {
            throw new Error("Param value is required");
        }
        if (param.customType || param.type.includes("tuple")) {
            let value;
            if (param.type.lastIndexOf("[") > 0) {
                value = param.value;
                return value.reduce((acc, val) => {
                    return [...acc, val.map(getValues)];
                }, []);
            }
            else {
                value = param.value;
                return value.map(getValues);
            }
        }
        if (param.messageType) {
            // TODO: Here we need to add the logic for type conversion
            // If message type is defined, we need to convert value. Value is always a `messageType`
            return handleTypeConversion(param);
        }
        return param.value;
    };
    if (!call.params)
        return "0x";
    return defaultAbiCoder.encode(call.params.map(getType), call.params.map(getValues));
};
export const decodeFromData = (call, data) => {
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
    const decodedData = new utils.Interface(ABI).decodeFunctionData(call.method, data);
    return decodedData.slice(0, data.length).map(manage);
};
export const decodeOutputData = (plugin, data) => {
    if (!plugin)
        return null;
    if (plugin instanceof Multicall) {
        // If the plugin method is multiCall, we handle it differently
        if (plugin.method === "multiCall") {
            // the returned types from plugin.getOutputParamsTypes() is a bit different so we have to
            // handle it differently. plugin.getOutputParamsTypes() returns string[][][]
            return [];
        }
        const outputTypes = plugin.getOutputParamsTypes();
        const outputParams = defaultAbiCoder.decode(outputTypes, data).map(manage);
        return outputParams;
    }
    const outputTypes = plugin.output.paramsList.map(({ param }) => param.fctType);
    return defaultAbiCoder.decode(outputTypes, data).map(manage);
};
function handleTypeConversion(param) {
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
    ["string_bytes32"]: (value) => utils.keccak256(utils.toUtf8Bytes(value)),
    ["string_bytes"]: (value) => utils.toUtf8Bytes(value),
};
//# sourceMappingURL=callParams.js.map