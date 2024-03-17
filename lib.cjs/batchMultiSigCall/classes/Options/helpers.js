"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateAddress = exports.validateInteger = exports.mustBeObject = exports.mustBeBoolean = exports.mustBeAddress = exports.mustBeInteger = void 0;
const ethers_1 = require("ethers");
const isAddress = ethers_1.ethers.utils.isAddress;
exports.mustBeInteger = [
    "validFrom",
    "expiresAt",
    "maxGasPrice",
    "recurrency.maxRepeats",
    "recurrency.chillTime",
    "multisig.minimumApprovals",
];
exports.mustBeAddress = ["builder.address"];
exports.mustBeBoolean = ["purgeable", "blockable", "authEnabled", "dryRun", "recurrency.accumetable"];
exports.mustBeObject = ["app", "builder", "recurrency", "multisig"];
// Validate Integer values in options
const validateInteger = (value, id) => {
    if (value.includes(".")) {
        throw new Error(`Options: ${id} cannot be a decimal`);
    }
    if (value.startsWith("-")) {
        throw new Error(`Options: ${id} cannot be negative`);
    }
    if (id === "recurrency.maxRepeats" && +value < 0) {
        throw new Error(`Options: ${id} should be at least 0. If value is 0 or 1, recurrency will not be enabled in order to save gas`);
    }
};
exports.validateInteger = validateInteger;
// Validate address values in options
const validateAddress = (value, id) => {
    if (!isAddress(value)) {
        throw new Error(`Options: ${id} is not a valid address`);
    }
};
exports.validateAddress = validateAddress;
//# sourceMappingURL=helpers.js.map