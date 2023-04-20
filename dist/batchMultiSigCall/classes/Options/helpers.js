"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateAddress = exports.validateInteger = exports.mustBeAddress = exports.mustBeInteger = void 0;
const utils_1 = require("ethers/lib/utils");
exports.mustBeInteger = ["validFrom", "expiresAt", "maxGasPrice", "maxRepeats", "chillTime", "minimumApprovals"];
exports.mustBeAddress = ["builder"];
// Validate Integer values in options
const validateInteger = (value, keys) => {
    const currentKey = keys[keys.length - 1];
    if (value.includes(".")) {
        throw new Error(`Options: ${keys.join(".")} cannot be a decimal`);
    }
    if (value.startsWith("-")) {
        throw new Error(`Options: ${keys.join(".")} cannot be negative`);
    }
    if (currentKey === "maxRepeats" && Number(value) < 0) {
        throw new Error(`Options: ${keys.join(".")} should be at least 0. If value is 0 or 1, recurrency will not be enabled in order to save gas`);
    }
};
exports.validateInteger = validateInteger;
// Validate address values in options
const validateAddress = (value, keys) => {
    if (!(0, utils_1.isAddress)(value)) {
        throw new Error(`Options: ${keys.join(".")} is not a valid address`);
    }
};
exports.validateAddress = validateAddress;
