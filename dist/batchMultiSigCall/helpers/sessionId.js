"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseCallID = exports.parseSessionID = exports.getSessionId = exports.manageCallId = exports.manageFlow = void 0;
const constants_1 = require("../../constants");
const manageFlow = (call) => {
    // const jump = (call.options && call.options.jump) || 0;
    const jump = 0;
    const flow = (call.options && call.options.flow) || "OK_CONT_FAIL_REVERT";
    if (jump > 15) {
        throw new Error("Jump value cannot exceed 15");
    }
    if (!constants_1.flows[flow]) {
        throw new Error("Flow not found");
    }
    return `0x${constants_1.flows[flow].value}${jump.toString(16)}`;
};
exports.manageFlow = manageFlow;
const manageCallId = (calls, call, index) => {
    // 4 - Permissions
    // 2 - Flow
    // 4 - Fail Jump
    // 4 - Ok Jump
    // 4 - Payer index
    // 4 - Call index
    // 8 - Gas limit
    // 2 - Flags
    // 0x0000000000000000000000000000000000000200010000000100010000000000
    const permissions = "0000";
    const flow = call?.options?.flow ? Number(constants_1.flows[call.options.flow].value).toString(16).padStart(1, "00") : "00";
    const payerIndex = Number(index + 1)
        .toString(16)
        .padStart(4, "0");
    const callIndex = Number(index + 1)
        .toString(16)
        .padStart(4, "0");
    const gasLimit = call?.options?.gasLimit ? Number(call.options.gasLimit).toString(16).padStart(8, "0") : "00000000";
    const flags = () => {
        if (call?.options?.falseMeansFail) {
            return "02";
        }
        if (call?.viewOnly) {
            return "01";
        }
        return "00";
    };
    let successJump = "0000";
    let failJump = "0000";
    if (call?.options?.jumpOnFail) {
        const nodeIndex = calls.findIndex((c) => c.nodeId === call.options.jumpOnFail);
        failJump = Number(nodeIndex - index - 1)
            .toString(16)
            .padStart(4, "0");
    }
    if (call?.options?.jumpOnSuccess) {
        const nodeIndex = calls.findIndex((c) => c.nodeId === call.options.jumpOnSuccess);
        successJump = Number(nodeIndex - index - 1)
            .toString(16)
            .padStart(4, "0");
    }
    return ("0x" +
        `${permissions}${flow}${failJump}${successJump}${payerIndex}${callIndex}${gasLimit}${flags()}`.padStart(64, "0"));
};
exports.manageCallId = manageCallId;
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
const getSessionId = (salt, options) => {
    const currentDate = new Date();
    if (options.expiresAt && Number(options.expiresAt) < currentDate.getTime() / 1000) {
        throw new Error("Expires at date cannot be in the past");
    }
    const minimumApprovals = options.multisig ? options.multisig.minimumApprovals.toString(16).padStart(2, "0") : "00";
    const version = "010101";
    const maxRepeats = options.recurrency ? Number(options.recurrency.maxRepeats).toString(16).padStart(4, "0") : "0000";
    const chillTime = options.recurrency
        ? Number(options.recurrency.chillTime).toString(16).padStart(8, "0")
        : "00000000";
    const beforeTimestamp = options.expiresAt ? Number(options.expiresAt).toString(16).padStart(10, "0") : "ffffffffff";
    const afterTimestamp = options.validFrom ? Number(options.validFrom).toString(16).padStart(10, "0") : "0000000000";
    const maxGasPrice = options.maxGasPrice
        ? Number(options.maxGasPrice).toString(16).padStart(16, "0")
        : "00000005D21DBA00"; // 25 Gwei
    let flagValue = 8; // EIP712 true by default
    if (options.recurrency?.accumetable)
        flagValue += 1;
    if (options.purgeable)
        flagValue += 2;
    if (options.blockable)
        flagValue += 4;
    const flags = flagValue.toString(16).padStart(2, "0");
    return `0x${salt}${minimumApprovals}${version}${maxRepeats}${chillTime}${beforeTimestamp}${afterTimestamp}${maxGasPrice}${flags}`;
};
exports.getSessionId = getSessionId;
const parseSessionID = (sessionId, builder) => {
    // const salt = sessionId.slice(2, 8);
    const minimumApprovals = parseInt(sessionId.slice(8, 10), 16);
    // const version = sessionId.slice(10, 16);
    const maxRepeats = parseInt(sessionId.slice(16, 20), 16).toString();
    const chillTime = parseInt(sessionId.slice(20, 28), 16).toString();
    const expiresAt = parseInt(sessionId.slice(28, 38), 16).toString();
    const validFrom = parseInt(sessionId.slice(38, 48), 16).toString();
    const maxGasPrice = parseInt(sessionId.slice(48, 64), 16).toString();
    const flagsNumber = parseInt(sessionId.slice(64, 66), 16);
    let flags = {
        eip712: true,
        accumetable: false,
        purgeable: false,
        blockable: false,
    };
    if (flagsNumber === 9) {
        flags = {
            ...flags,
            accumetable: true,
        };
    }
    else if (flagsNumber === 10) {
        flags = {
            ...flags,
            purgeable: true,
        };
    }
    else if (flagsNumber === 11) {
        flags = {
            ...flags,
            accumetable: true,
            purgeable: true,
        };
    }
    else if (flagsNumber === 12) {
        flags = {
            ...flags,
            blockable: true,
        };
    }
    else if (flagsNumber === 13) {
        flags = {
            ...flags,
            accumetable: true,
            blockable: true,
        };
    }
    else if (flagsNumber === 14) {
        flags = {
            ...flags,
            purgeable: true,
            blockable: true,
        };
    }
    else if (flagsNumber === 15) {
        flags = {
            ...flags,
            accumetable: true,
            purgeable: true,
            blockable: true,
        };
    }
    const data = {
        validFrom,
        expiresAt,
        maxGasPrice,
        blockable: flags.blockable,
        purgeable: flags.purgeable,
    };
    return {
        ...data,
        builder,
        recurrency: {
            accumetable: flags.accumetable,
            chillTime,
            maxRepeats,
        },
        multisig: {
            minimumApprovals,
        },
    };
};
exports.parseSessionID = parseSessionID;
const parseCallID = (callId) => {
    const permissions = callId.slice(2, 6);
    const flowNumber = parseInt(callId.slice(6, 8), 16);
    const jumpOnFail = parseInt(callId.slice(8, 12), 16);
    const jumpOnSuccess = parseInt(callId.slice(12, 16), 16);
    const payerIndex = parseInt(callId.slice(16, 20), 16);
    const callIndex = parseInt(callId.slice(20, 24), 16);
    const gasLimit = parseInt(callId.slice(24, 32), 16);
    const flags = parseInt(callId.slice(32, 34), 16);
    const getFlow = () => {
        const flow = Object.entries(constants_1.flows).find(([, value]) => {
            return value.value === flowNumber.toString();
        });
        return constants_1.Flow[flow[0]];
    };
    return {
        options: {
            flow: getFlow(),
            jumpOnFail,
            jumpOnSuccess,
            gasLimit,
        },
        viewOnly: flags === 1,
        permissions,
        payerIndex,
        callIndex,
    };
};
exports.parseCallID = parseCallID;