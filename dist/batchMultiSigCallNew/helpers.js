"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSessionId = exports.handleTypedHashes = exports.handleTypes = exports.handleData = exports.handleEnsHash = exports.handleFunctionSignature = exports.handleMethodInterface = void 0;
const ethers_1 = require("ethers");
const helpers_1 = require("../helpers");
const nullValue = "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470";
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
const getSessionId = (salt, options) => {
    // 6 - Salt
    // 2 - External signers
    // 6 - Version
    // 4 - Recurrent
    // 8 - Chill time
    // 10 - After timestamp
    // 10 - Before timestamp
    // 16 - Gas price limit
    // 2 - Flags
    const externalSigners = options.multisig
        ? options.multisig.externalSigners.length.toString(16).padStart(2, "0")
        : "00";
    const version = "010101";
    const recurrent = options.recurrency ? Number(options.recurrency.maxRepeats).toString(16).padStart(4, "0") : "0000";
    const chillTime = options.recurrency
        ? Number(options.recurrency.chillTime).toString(16).padStart(8, "0")
        : "00000000";
    const afterTimestamp = options.validFrom ? Number(options.validFrom).toString(16).padStart(10, "0") : "0000000000";
    const beforeTimestamp = options.expiresAt ? Number(options.expiresAt).toString(16).padStart(10, "0") : "ffffffffff";
    const gasPriceLimit = options.maxGasPrice
        ? Number(options.maxGasPrice).toString(16).padStart(16, "0")
        : "00000005D21DBA00"; // 25 Gwei
    const flags = `10`; // Have to implement getFlags function
    return `0x${salt}${externalSigners}${version}${recurrent}${chillTime}${afterTimestamp}${beforeTimestamp}${gasPriceLimit}${flags}`;
};
exports.getSessionId = getSessionId;
