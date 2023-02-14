"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyParam = exports.verifyOptions = void 0;
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const utils_1 = require("ethers/lib/utils");
const mustBeInteger = ["validFrom", "expiresAt", "maxGasPrice", "maxRepeats", "chillTime", "minimumApprovals"];
const mustBeAddress = ["builder"];
// Validate Integer values in options
const validateInteger = (value, keys) => {
    const currentKey = keys[keys.length - 1];
    if (value.includes(".")) {
        throw new Error(`Options: ${keys.join(".")} cannot be a decimal`);
    }
    if (value.startsWith("-")) {
        throw new Error(`Options: ${keys.join(".")} cannot be negative`);
    }
    if (currentKey === "maxRepeats" && Number(value) < 1) {
        throw new Error(`Options: ${keys.join(".")} should be at least 1. If value is 1, recurrency will not be enabled in order to save gas`);
    }
};
// Validate address values in options
const validateAddress = (value, keys) => {
    if (!(0, utils_1.isAddress)(value)) {
        throw new Error(`Options: ${keys.join(".")} is not a valid address`);
    }
};
const validateOptionsValues = (value, parentKeys = []) => {
    if (!value) {
        return;
    }
    Object.keys(value).forEach((key) => {
        const objKey = key;
        if (typeof value[objKey] === "object") {
            validateOptionsValues(value[objKey], [...parentKeys, objKey]);
        }
        // Integer validator
        if (mustBeInteger.includes(objKey)) {
            validateInteger(value[objKey], [...parentKeys, objKey]);
        }
        // Address validator
        if (mustBeAddress.includes(objKey)) {
            validateAddress(value[objKey], [...parentKeys, objKey]);
        }
        // Expires at validator
        if (objKey === "expiresAt") {
            const expiresAt = Number(value[objKey]);
            const now = Number(new Date().getTime() / 1000).toFixed();
            const validFrom = value.validFrom;
            if ((0, bignumber_js_1.default)(expiresAt).isLessThanOrEqualTo(now)) {
                throw new Error(`Options: expiresAt must be in the future`);
            }
            if (validFrom && (0, bignumber_js_1.default)(expiresAt).isLessThanOrEqualTo(validFrom)) {
                throw new Error(`Options: expiresAt must be greater than validFrom`);
            }
        }
    });
};
const verifyOptions = (options) => {
    validateOptionsValues(options);
};
exports.verifyOptions = verifyOptions;
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
        if (!(0, utils_1.isAddress)(param.value)) {
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
