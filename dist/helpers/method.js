"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getParamsLength = exports.getEncodedMethodParams = exports.getMethodInterface = void 0;
const ethers_1 = require("ethers");
const utils_1 = require("ethers/lib/utils");
const instanceOf_1 = require("./instanceOf");
// From method and params create tuple
const getMethodInterface = (call) => {
    const getParamsType = (param) => {
        if ((0, instanceOf_1.instanceOfParams)(param.value)) {
            if (Array.isArray(param.value[0])) {
                const value = param.value[0];
                return `(${value.map(getParamsType).join(",")})[]`;
            }
            else {
                const value = param.value;
                return `(${value.map(getParamsType).join(",")})`;
            }
        }
        return param.type;
    };
    const params = call.params.map(getParamsType);
    return `${call.method}(${params})`;
};
exports.getMethodInterface = getMethodInterface;
const getEncodedMethodParams = (call, withFunction) => {
    if (!call.method)
        return "0x";
    if (withFunction) {
        const ABI = [`function ${call.method}(${call.params.map((item) => item.type).join(",")})`];
        const iface = new ethers_1.utils.Interface(ABI);
        return iface.encodeFunctionData(call.method, call.params.map((item) => item.value));
    }
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
        return param.value;
    };
    return utils_1.defaultAbiCoder.encode(call.params.map(getType), call.params.map(getValues));
};
exports.getEncodedMethodParams = getEncodedMethodParams;
const getParamsLength = (encodedParams) => {
    const paramsLength = utils_1.defaultAbiCoder.encode(["bytes"], [encodedParams]).slice(66, 66 + 64);
    return `0x${paramsLength}`;
};
exports.getParamsLength = getParamsLength;
