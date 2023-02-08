"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyOptions = void 0;
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
    if (value.includes("-")) {
        throw new Error(`Options: ${keys.join(".")} cannot be negative`);
    }
    if (currentKey === "maxRepeats" && Number(value) < 2) {
        throw new Error(`Options: ${keys.join(".")} should be at least 2`);
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
