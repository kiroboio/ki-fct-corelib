"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSessionId = exports.handleTypedHashes = exports.handleTypes = exports.handleData = exports.handleEnsHash = exports.handleFunctionSignature = exports.handleMethodInterface = exports.handleTo = void 0;
const ethers_1 = require("ethers");
const helpers_1 = require("../helpers");
const nullValue = "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470";
const handleTo = (self, call) => {
    // If call is a validator method, return validator address as to address
    if (call.validator) {
        return call.validator.validatorAddress;
    }
    // Check if to is a valid address
    if (ethers_1.utils.isAddress(call.to)) {
        return call.to;
    }
    // Else it is a variable
    return self.getVariableFCValue(call.to);
};
exports.handleTo = handleTo;
const handleMethodInterface = (call) => {
    // If call is not a ETH transfer
    if (call.method) {
        // If call is a validation call
        if (call.validator) {
            return (0, helpers_1.getValidatorMethodInterface)(call.validator);
        }
        // Else it's a standard method interface
        return (0, helpers_1.getMethodInterface)(call);
    }
    // Else it's a ETH transfer
    return "";
};
exports.handleMethodInterface = handleMethodInterface;
const handleFunctionSignature = (call) => {
    if (call.method) {
        const value = call.validator ? (0, helpers_1.getValidatorMethodInterface)(call.validator) : (0, helpers_1.getMethodInterface)(call);
        return ethers_1.utils.id(value);
    }
    return nullValue;
};
exports.handleFunctionSignature = handleFunctionSignature;
const handleEnsHash = (call) => {
    if (call.toEnsHash) {
        return ethers_1.utils.id(call.toEnsHash);
    }
    return nullValue;
};
exports.handleEnsHash = handleEnsHash;
const handleData = (call) => {
    if (call.validator) {
        return (0, helpers_1.getValidatorData)(call, true);
    }
    return (0, helpers_1.getEncodedMethodParams)(call);
};
exports.handleData = handleData;
const handleTypes = (call) => {
    if (call.params) {
        return (0, helpers_1.getTypesArray)(call.params);
    }
    return [];
};
exports.handleTypes = handleTypes;
const handleTypedHashes = (call, typedData) => {
    if (call.params) {
        return (0, helpers_1.getTypedHashes)(call.params, typedData);
    }
    return [];
};
exports.handleTypedHashes = handleTypedHashes;
const getSessionId = (salt, batchCall) => {
    // 6 - Salt
    // 2 - External signers
    // 6 - Version
    // 4 - Recurrent
    // 8 - Chill time
    // 10 - After timestamp
    // 10 - Before timestamp
    // 16 - Gas price limit
    // 2 - Flags
    const externalSigners = batchCall.multisig
        ? batchCall.multisig.externalSigners.length.toString(16).padStart(2, "0")
        : "00";
    const version = "010101";
    const recurrent = batchCall.recurrency
        ? Number(batchCall.recurrency.maxRepeats).toString(16).padStart(4, "0")
        : "0000";
    const chillTime = batchCall.recurrency
        ? Number(batchCall.recurrency.chillTime).toString(16).padStart(8, "0")
        : "00000000";
    const afterTimestamp = batchCall.validFrom
        ? Number(batchCall.validFrom).toString(16).padStart(10, "0")
        : "0000000000";
    const beforeTimestamp = batchCall.expiresAt
        ? Number(batchCall.expiresAt).toString(16).padStart(10, "0")
        : "ffffffffff";
    const gasPriceLimit = batchCall.maxGasPrice
        ? Number(batchCall.maxGasPrice).toString(16).padStart(16, "0")
        : "00000005D21DBA00"; // 25 Gwei
    // Flags needs to be updated - currently only support for one flag (payment/repay)
    // const getFlags = () => {
    //   if (batchCall.payment) {
    // }
    const flags = `10`; // Have to implement getFlags function
    return `0x${salt}${externalSigners}${version}${recurrent}${chillTime}${afterTimestamp}${beforeTimestamp}${gasPriceLimit}${flags}`;
};
exports.getSessionId = getSessionId;
