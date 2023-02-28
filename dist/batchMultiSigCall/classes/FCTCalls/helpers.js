"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getParamsFromInputs = exports.verifyParam = exports.isAddress = exports.isInteger = void 0;
const ethers_1 = require("ethers");
const isInteger = (value, key) => {
    if (value.length === 0) {
        throw new Error(`${key} cannot be empty string`);
    }
    if (value.startsWith("-")) {
        throw new Error(`${key} cannot be negative`);
    }
    if (value.includes(".")) {
        throw new Error(`${key} cannot be a decimal`);
    }
};
exports.isInteger = isInteger;
const isAddress = (value, key) => {
    if (value.length === 0) {
        throw new Error(`${key} address cannot be empty string`);
    }
    if (!ethers_1.utils.isAddress(value)) {
        throw new Error(`${key} address is not a valid address`);
    }
};
exports.isAddress = isAddress;
const verifyParam = (param) => {
    if (!param.value) {
        throw new Error(`Param ${param.name} is missing a value`);
    }
    if (typeof param.value !== "string") {
        return;
    }
    // uint value
    if (param.type.startsWith("uint")) {
        if (param.value.includes(".")) {
            throw new Error(`Param ${param.name} cannot be a decimal`);
        }
        if (param.value.startsWith("-")) {
            throw new Error(`Param ${param.name} cannot be negative`);
        }
    }
    // int value
    if (param.type.startsWith("int")) {
        if (param.value.includes(".")) {
            throw new Error(`Param ${param.name} cannot be a decimal`);
        }
    }
    // address
    if (param.type === "address") {
        if (!ethers_1.utils.isAddress(param.value)) {
            throw new Error(`Param ${param.name} is not a valid address`);
        }
    }
    // bytes
    if (param.type.startsWith("bytes")) {
        if (!param.value.startsWith("0x")) {
            throw new Error(`Param ${param.name} is not a valid bytes value`);
        }
    }
};
exports.verifyParam = verifyParam;
const getParamsFromInputs = (inputs, values) => {
    return inputs.map((input, i) => {
        if (input.type === "tuple") {
            return {
                name: input.name,
                type: input.type,
                customType: true,
                value: (0, exports.getParamsFromInputs)(input.components, values[i]),
            };
        }
        if (input.type === "tuple[]") {
            return {
                name: input.name,
                type: input.type,
                customType: true,
                value: values[i].map((tuple) => (0, exports.getParamsFromInputs)(input.components, tuple)),
            };
        }
        let value = values[i];
        // Check if value isn't a variable
        const variables = ["0xfb0", "0xfa0", "0xfc00000", "0xfd00000", "0xfdb000"];
        if (ethers_1.BigNumber.isBigNumber(value)) {
            const hexString = value.toHexString().toLowerCase();
            if (variables.some((v) => hexString.startsWith(v))) {
                value = hexString;
            }
            value = value.toString();
        }
        if (typeof value === "number") {
            value = value.toString();
        }
        return {
            name: input.name,
            type: input.type,
            value,
        };
    });
};
exports.getParamsFromInputs = getParamsFromInputs;
