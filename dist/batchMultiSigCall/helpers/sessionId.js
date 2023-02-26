"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseCallID = exports.parseSessionID = exports.getSessionId = exports.manageCallId = void 0;
const constants_1 = require("../../constants");
const sessionIdFlag = {
    accumetable: 0x1,
    purgeable: 0x2,
    blockable: 0x4,
    eip712: 0x8,
    authEnabled: 0x10,
};
const valueWithPadStart = (value, padStart) => {
    return Number(value).toString(16).padStart(padStart, "0");
};
const manageCallId = (calls, call, index) => {
    // This is the structure of callId string
    // 4 - Permissions
    // 2 - Flow
    // 4 - Fail Jump
    // 4 - Ok Jump
    // 4 - Payer index
    // 4 - Call index
    // 8 - Gas limit
    // 2 - Flags
    // 0x00000000000000000000000000000000 / 0000 / 05 / 0000 / 0001 / 0001 / 0001 / 00000000 / 00;
    const permissions = "0000";
    const flow = valueWithPadStart(constants_1.flows[call.options.flow].value, 2);
    const payerIndex = valueWithPadStart(index + 1, 4);
    const callIndex = valueWithPadStart(index + 1, 4);
    const gasLimit = valueWithPadStart(call.options.gasLimit, 8);
    const flags = () => {
        const callType = constants_1.CALL_TYPE[call.options.callType];
        const falseMeansFail = call.options.falseMeansFail ? 4 : 0;
        return callType + (parseInt(callType, 16) + falseMeansFail).toString(16);
    };
    let successJump = "0000";
    let failJump = "0000";
    if (call.options) {
        const { jumpOnFail, jumpOnSuccess } = call.options;
        if (jumpOnFail && jumpOnFail !== constants_2.NO_JUMP) {
            const nodeIndex = calls.findIndex((c) => c.nodeId === call?.options?.jumpOnFail);
            failJump = Number(nodeIndex - index - 1)
                .toString(16)
                .padStart(4, "0");
        }
        if (jumpOnSuccess && jumpOnSuccess !== constants_2.NO_JUMP) {
            const nodeIndex = calls.findIndex((c) => c.nodeId === call?.options?.jumpOnSuccess);
            successJump = Number(nodeIndex - index - 1)
                .toString(16)
                .padStart(4, "0");
        }
    }
    return ("0x" +
        `${permissions}${flow}${failJump}${successJump}${payerIndex}${callIndex}${gasLimit}${flags()}`.padStart(64, "0"));
};
exports.manageCallId = manageCallId;
// TODO: Update sessionID to include auth_enabled value
// Deconstructed sessionID
// 6 - Salt
// 2 - External signers
// 6 - Version
// 4 - Max Repeats
// 8 - Chill time
// 10 - After timestamp
// 10 - Before timestamp
// 16 - Gas price limit
// 2 - Flags
const getSessionId = (salt, versionHex, options) => {
    const currentDate = new Date();
    const { recurrency, multisig } = options;
    if (options.expiresAt && Number(options.expiresAt) < currentDate.getTime() / 1000) {
        throw new Error("Expires at date cannot be in the past");
    }
    const minimumApprovals = multisig.externalSigners.length > 0
        ? Number(options.multisig.minimumApprovals).toString(16).padStart(2, "0")
        : "00";
    const version = versionHex.slice(2);
    const maxRepeats = options.recurrency ? Number(options.recurrency.maxRepeats).toString(16).padStart(4, "0") : "0000";
    const chillTime = options.recurrency
        ? Number(options.recurrency.chillTime).toString(16).padStart(8, "0")
        : "00000000";
    const beforeTimestamp = options.expiresAt ? Number(options.expiresAt).toString(16).padStart(10, "0") : "ffffffffff";
    const afterTimestamp = options.validFrom ? Number(options.validFrom).toString(16).padStart(10, "0") : "0000000000";
    const maxGasPrice = options.maxGasPrice
        ? Number(options.maxGasPrice).toString(16).padStart(16, "0")
        : "00000005D21DBA00"; // 25 Gwei
    let flagValue = 0;
    flagValue += sessionIdFlag.eip712; // EIP712 true by default
    if (options.recurrency?.accumetable)
        flagValue += sessionIdFlag.accumetable;
    if (options.purgeable)
        flagValue += sessionIdFlag.purgeable;
    if (options.blockable)
        flagValue += sessionIdFlag.blockable;
    if (options.authEnabled)
        flagValue += sessionIdFlag.authEnabled;
    const flags = flagValue.toString(16).padStart(2, "0");
    return `0x${salt}${minimumApprovals}${version}${maxRepeats}${chillTime}${beforeTimestamp}${afterTimestamp}${maxGasPrice}${flags}`;
};
exports.getSessionId = getSessionId;
const parseSessionID = (sessionId, builder, externalSigners = []) => {
    // const salt = sessionId.slice(2, 8);
    const minimumApprovals = parseInt(sessionId.slice(8, 10), 16).toString();
    // const version = sessionId.slice(10, 16);
    const maxRepeats = parseInt(sessionId.slice(16, 20), 16).toString();
    const chillTime = parseInt(sessionId.slice(20, 28), 16).toString();
    const expiresAt = parseInt(sessionId.slice(28, 38), 16).toString();
    const validFrom = parseInt(sessionId.slice(38, 48), 16).toString();
    const maxGasPrice = parseInt(sessionId.slice(48, 64), 16).toString();
    const flagsNumber = parseInt(sessionId.slice(64, 66), 16);
    const flags = {
        eip712: (flagsNumber & sessionIdFlag.eip712) !== 0,
        accumetable: (flagsNumber & sessionIdFlag.accumetable) !== 0,
        purgeable: (flagsNumber & sessionIdFlag.purgeable) !== 0,
        blockable: (flagsNumber & sessionIdFlag.blockable) !== 0,
        authEnabled: (flagsNumber & sessionIdFlag.authEnabled) !== 0,
    };
    return {
        validFrom,
        expiresAt,
        maxGasPrice,
        blockable: flags.blockable,
        purgeable: flags.purgeable,
        authEnabled: flags.authEnabled,
        builder,
        recurrency: {
            accumetable: flags.accumetable,
            chillTime,
            maxRepeats,
        },
        multisig: {
            minimumApprovals,
            externalSigners,
        },
    };
};
exports.parseSessionID = parseSessionID;
const parseCallID = (callId, jumpsAsNumbers = false) => {
    const permissions = callId.slice(36, 38);
    const flowNumber = parseInt(callId.slice(38, 40), 16);
    const jumpOnFail = parseInt(callId.slice(40, 44), 16);
    const jumpOnSuccess = parseInt(callId.slice(44, 48), 16);
    const payerIndex = parseInt(callId.slice(48, 52), 16);
    const callIndex = parseInt(callId.slice(52, 56), 16);
    const gasLimit = parseInt(callId.slice(56, 64), 16).toString();
    const flags = parseInt(callId.slice(64, 66), 16);
    const getFlow = () => {
        const flow = Object.entries(constants_1.flows).find(([, value]) => {
            return value.value === flowNumber.toString();
        });
        if (!flow)
            throw new Error("Invalid flow");
        return constants_1.Flow[flow[0]];
    };
    const options = {
        gasLimit,
        flow: getFlow(),
        jumpOnFail: 0,
        jumpOnSuccess: 0,
    };
    if (jumpsAsNumbers) {
        options["jumpOnFail"] = jumpOnFail;
        options["jumpOnSuccess"] = jumpOnSuccess;
    }
    else {
        if (jumpOnFail)
            options["jumpOnFail"] = `node${callIndex + jumpOnFail}`;
        if (jumpOnSuccess)
            options["jumpOnSuccess"] = `node${callIndex + jumpOnFail}`;
    }
    return {
        options,
        viewOnly: flags === 1,
        permissions,
        payerIndex,
        callIndex,
    };
};
exports.parseCallID = parseCallID;
