"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTypedHashes = exports.getTypesArray = void 0;
const eth_sig_util_1 = require("@metamask/eth-sig-util");
const ethers_1 = require("ethers");
const TYPE_NATIVE = 1000;
const TYPE_STRING = 2000;
const TYPE_BYTES = 3000;
const TYPE_ARRAY = 4000;
const TYPE_ARRAY_WITH_LENGTH = 5000;
const typeValue = (param) => {
    // If type is an array
    if (param.type.lastIndexOf("[") > 0 && !param.hashed) {
        if (param.customType || param.type.includes("tuple")) {
            const value = param.value;
            return [TYPE_ARRAY, value.length, ...(0, exports.getTypesArray)(param.value[0])];
        }
        const parameter = { ...param, type: param.type.slice(0, param.type.lastIndexOf("[")) };
        const insideType = typeValue(parameter);
        const type = param.type.indexOf("]") - param.type.indexOf("[") === 1 ? TYPE_ARRAY : TYPE_ARRAY_WITH_LENGTH;
        return [type, ...insideType];
    }
    // If type is a string
    if (param.type === "string" && !param.hashed) {
        return [TYPE_STRING];
    }
    // If type is bytes
    if (param.type === "bytes" && !param.hashed) {
        return [TYPE_BYTES];
    }
    // If param is custom struct
    if (param.customType || param.type.includes("tuple")) {
        const values = param.value;
        const types = values.reduce((acc, item) => {
            return [...acc, ...typeValue(item)];
        }, []);
        if (!types.some((item) => item !== TYPE_NATIVE)) {
            return [];
        }
        return [values.length, ...types];
    }
    // If all statements above are false, then type is a native type
    return [TYPE_NATIVE];
};
// Get Types array
const getTypesArray = (params) => {
    const types = params.reduce((acc, item) => {
        const data = typeValue(item);
        return [...acc, ...data];
    }, []);
    if (params.length === 1 && params[0].customType) {
        // Remove first element if it is a custom type
        types.shift();
    }
    if (!types.some((item) => item !== TYPE_NATIVE)) {
        return [];
    }
    return types;
};
exports.getTypesArray = getTypesArray;
const getTypedHashes = (params, typedData) => {
    return params.reduce((acc, item) => {
        if (item.customType) {
            const type = item.type.lastIndexOf("[") > 0 ? item.type.slice(0, item.type.lastIndexOf("[")) : item.type;
            return [...acc, ethers_1.utils.hexlify(ethers_1.utils.hexlify(eth_sig_util_1.TypedDataUtils.hashType(type, typedData.types)))];
        }
        return acc;
    }, []);
};
exports.getTypedHashes = getTypedHashes;
