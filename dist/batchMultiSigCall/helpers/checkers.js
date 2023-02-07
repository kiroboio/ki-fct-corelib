"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyOptions = void 0;
const mustBeInteger = ["validFrom", "expiresAt", "maxGasPrice", "maxRepeats", "chillTime"];
// Validate Integer values in options
const validateInteger = (value, keys) => {
    const currentKey = keys[keys.length - 1];
    if (value.includes(".")) {
        throw new Error(`Options: ${keys.join(".")} cannot be a decimal`);
    }
    if (value.includes("-")) {
        throw new Error(`Options: ${keys.join(".")} cannot be negative`);
    }
    if (currentKey === "maxRepeats" && Number(value) < 2) {
        throw new Error(`Options: ${keys.join(".")} should be at least 2`);
    }
};
const validateValues = (value, parentKeys = []) => {
    Object.keys(value).forEach((key) => {
        const objKey = key;
        if (typeof value[objKey] === "object") {
            validateValues(value[objKey], [...parentKeys, objKey]);
        }
        else if (mustBeInteger.includes(objKey)) {
            validateInteger(value[objKey], [...parentKeys, objKey]);
        }
    });
};
const verifyOptions = (options) => {
    validateValues(options);
};
exports.verifyOptions = verifyOptions;
