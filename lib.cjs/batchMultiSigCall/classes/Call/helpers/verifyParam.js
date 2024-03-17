"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyParam = exports.isAddress = exports.isInteger = void 0;
const ethers_1 = require("ethers");
const helpers_1 = require("../../../../helpers");
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
    const type = param.messageType || param.type;
    if (!param.value) {
        throw new Error(`Param ${param.name} is missing a value`);
    }
    if (Array.isArray(param.value) && type.includes("[") && type.includes("]")) {
        if (helpers_1.InstanceOf.Variable(param.value)) {
            throw new Error(`Param ${param.name} (${type}) - arrays cannot be set as Variables`);
        }
        if (type.indexOf("]") - type.indexOf("[") > 1) {
            const length = +type.slice(type.indexOf("[") + 1, type.indexOf("]"));
            if (param.value.length !== length) {
                throw new Error(`Param ${param.name} (${type}) value is not an array of length ${length}`);
            }
        }
        const baseType = type.slice(0, type.lastIndexOf("["));
        param.value.forEach((value, index) => {
            (0, exports.verifyParam)({
                name: `${param.name}[${index}]`,
                type: baseType,
                value: value,
            });
        });
    }
    if (helpers_1.InstanceOf.Variable(param.value))
        return;
    // Check if type boolean is a boolean value
    if (type === "bool") {
        if (typeof param.value !== "boolean") {
            throw new Error(`Param ${param.name} is not a boolean`);
        }
    }
    if (typeof param.value !== "string") {
        return;
    }
    // uint value
    if (type.startsWith("uint")) {
        if (param.value.includes(".")) {
            throw new Error(`Param ${param.name} cannot be a decimal`);
        }
        if (param.value.startsWith("-")) {
            throw new Error(`Param ${param.name} cannot be negative`);
        }
    }
    // int value
    if (type.startsWith("int")) {
        if (param.value.includes(".")) {
            throw new Error(`Param ${param.name} cannot be a decimal`);
        }
    }
    // address
    if (type === "address") {
        if (!ethers_1.utils.isAddress(param.value)) {
            throw new Error(`Param ${param.name} is not a valid address`);
        }
    }
    // bytes
    if (type.startsWith("bytes")) {
        if (!param.value.startsWith("0x")) {
            throw new Error(`Param ${param.name} is not a valid bytes value`);
        }
        // Check if type has a length
        const length = type.match(/\d+/g);
        if (!length) {
            // If no length, then the type is `bytes`
            if (helpers_1.InstanceOf.Variable(param.value)) {
                throw new Error(`Param ${param.name} (${type}) - bytes cannot be set as Variables`);
            }
            return;
        }
        const requiredLength = +length[0] * 2 + 2;
        if (param.value.length !== requiredLength) {
            throw new Error(`Param ${param.name} is not a valid ${type} value`);
        }
    }
};
exports.verifyParam = verifyParam;
//# sourceMappingURL=verifyParam.js.map