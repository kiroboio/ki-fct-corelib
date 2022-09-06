"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSessionId = exports.manageCallId = exports.manageFlow = exports.handleTypedHashes = exports.handleTypes = exports.handleData = exports.handleEnsHash = exports.handleFunctionSignature = exports.handleMethodInterface = void 0;
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
const manageFlow = (call) => {
    // const jump = (call.options && call.options.jump) || 0;
    const jump = 0;
    const flow = (call.options && call.options.flow) || "OK_CONT_FAIL_REVERT";
    if (jump > 15) {
        throw new Error("Jump value cannot exceed 15");
    }
    if (!helpers_1.flows[flow]) {
        throw new Error("Flow not found");
    }
    return `0x${helpers_1.flows[flow].value}${jump.toString(16)}`;
};
exports.manageFlow = manageFlow;
const manageCallId = (call, index) => {
    // 4 - Permissions
    // 2 - Flow
    // 4 - Fail Jump
    // 4 - Ok Jump
    // 4 - Payer index
    // 4 - Call index
    // 8 - Gas limit
    // 2 - Flags
    const permissions = "0000";
    const flow = call?.options?.flow ? Number(helpers_1.flows[call.options.flow].value).toString(16).padStart(1, "0") : "0";
    const failJump = call?.options?.jumpOnFail ? Number(call.options.jumpOnFail).toString(16).padStart(4, "0") : "00";
    const successJump = call?.options?.jumpOnSuccess
        ? Number(call.options.jumpOnSuccess).toString(16).padStart(4, "0")
        : "0000";
    const payerIndex = Number(index).toString(16).padStart(4, "0");
    const callIndex = Number(index).toString(16).padStart(4, "0");
    const gasLimit = call?.options?.gasLimit ? Number(call.options.gasLimit).toString(16).padStart(8, "0") : "00000000";
    const flags = `0${call.viewOnly ? "1" : "0"}`;
    return `0x${permissions}${flow}${failJump}${successJump}${payerIndex}${callIndex}${gasLimit}${flags}`;
};
exports.manageCallId = manageCallId;
const getSessionId = (salt, options) => {
    // 6 - Salt
    // 2 - External signers
    // 6 - Version
    // 4 - Max Repeats
    // 8 - Chill time
    // 10 - After timestamp
    // 10 - Before timestamp
    // 16 - Gas price limit
    // 2 - Flags
    const externalSigners = options.multisig ? options.multisig.minimumApprovals.toString(16).padStart(2, "0") : "00";
    const version = "010101";
    const recurrent = options.recurrency ? Number(options.recurrency.maxRepeats).toString(16).padStart(4, "0") : "0000";
    const chillTime = options.recurrency
        ? Number(options.recurrency.chillTime).toString(16).padStart(8, "0")
        : "00000000";
    const beforeTimestamp = options.expiresAt ? Number(options.expiresAt).toString(16).padStart(10, "0") : "ffffffffff"; // TODO: Date right now + 30 days
    const afterTimestamp = options.validFrom ? Number(options.validFrom).toString(16).padStart(10, "0") : "0000000000"; // TODO: Date right now
    const gasPriceLimit = options.maxGasPrice
        ? Number(options.maxGasPrice).toString(16).padStart(16, "0")
        : "00000005D21DBA00"; // 25 Gwei
    let flagValue = 8; // EIP712 true by default
    if (options.recurrency?.accumetable)
        flagValue += 1;
    if (options.purgeable)
        flagValue += 2;
    if (options.cancelable)
        flagValue += 4;
    const flags = flagValue.toString(16).padStart(2, "0");
    return `0x${salt}${externalSigners}${version}${recurrent}${chillTime}${beforeTimestamp}${afterTimestamp}${gasPriceLimit}${flags}`;
};
exports.getSessionId = getSessionId;
