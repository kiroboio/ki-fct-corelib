"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.manageValidationAndComputed = exports.executedCallsFromRawLogs = exports.executedCallsFromLogs = exports.txTraceMapLog = exports.verifyMessageHashRaw = exports.verifyMessageHash = exports.getTraceData = exports.getCallsFromTrace = void 0;
const Interfaces_1 = require("../../../../helpers/Interfaces");
const batchMultiSigInterface = Interfaces_1.Interfaces.FCT_BatchMultiSigCall;
const controllerInterface = Interfaces_1.Interfaces.FCT_Controller;
function getCallsFromTrace(trace) {
    return trace.filter((call) => {
        return (call.traceAddress.length === 7 &&
            call.traceAddress[0] === 0 &&
            call.traceAddress[1] === 0 &&
            call.traceAddress[3] === 0 &&
            call.traceAddress[4] === 0 &&
            call.traceAddress[5] === 2 &&
            call.traceAddress[6] === 2);
    });
}
exports.getCallsFromTrace = getCallsFromTrace;
function getTraceData({ calls, callsFromTenderlyTrace, executedCalls, computedVariables, }) {
    return executedCalls.reduce((acc, executedCall, index) => {
        const fctCall = calls[Number(executedCall.callIndex) - 1];
        const callResult = callsFromTenderlyTrace[index];
        const input = callResult.input;
        const output = callResult.output;
        const resData = fctCall.decodeData({
            inputData: input,
            outputData: output,
        });
        acc.calls = [
            ...acc.calls,
            {
                method: fctCall.call.method ?? "",
                value: callResult.value ? parseInt(callResult.value, 16).toString() : "0",
                inputData: resData?.inputData ?? [],
                outputData: resData?.outputData ?? [],
                error: callResult.error || callResult.errorString || null,
                isSuccess: executedCall.isSuccess,
                id: fctCall.nodeId,
            },
        ];
        (0, exports.manageValidationAndComputed)(acc, fctCall, computedVariables);
        return acc;
    }, {
        calls: [],
        validations: [],
        computed: [],
    });
}
exports.getTraceData = getTraceData;
const verifyMessageHash = (logs, messageHas) => {
    const rawLogs = logs.map((log) => log.raw);
    return (0, exports.verifyMessageHashRaw)(rawLogs, messageHas);
};
exports.verifyMessageHash = verifyMessageHash;
const verifyMessageHashRaw = (logs, messageHashFromFCT) => {
    const messageHash = logs.find((log) => {
        try {
            return controllerInterface.parseLog(log).name === "FCTE_Registered";
        }
        catch (e) {
            return false;
        }
    })?.topics[2];
    console.log("messageHash", messageHash);
    console.log("messageHashFromFCT", messageHashFromFCT);
    if (messageHash.toLowerCase() !== messageHashFromFCT.toLowerCase()) {
        throw new Error("Message hash mismatch");
    }
    return true;
};
exports.verifyMessageHashRaw = verifyMessageHashRaw;
const txTraceMapLog = (log) => {
    const parsedLog = batchMultiSigInterface.parseLog(log);
    return {
        id: parsedLog.args.id,
        caller: parsedLog.args.caller,
        callIndex: parsedLog.args.callIndex.toString(),
        isSuccess: parsedLog.name === "FCTE_CallSucceed",
    };
};
exports.txTraceMapLog = txTraceMapLog;
const executedCallsFromLogs = (logs, messageHash) => {
    const rawLogs = logs.map((log) => log.raw);
    return (0, exports.executedCallsFromRawLogs)(rawLogs, messageHash);
};
exports.executedCallsFromLogs = executedCallsFromLogs;
const executedCallsFromRawLogs = (rawLogs, messageHash) => {
    (0, exports.verifyMessageHashRaw)(rawLogs, messageHash);
    return rawLogs
        .filter((log) => {
        try {
            return (batchMultiSigInterface.parseLog(log).name === "FCTE_CallSucceed" ||
                batchMultiSigInterface.parseLog(log).name === "FCTE_CallFailed");
        }
        catch (e) {
            return false;
        }
    })
        .map(exports.txTraceMapLog);
};
exports.executedCallsFromRawLogs = executedCallsFromRawLogs;
const manageValidationAndComputed = (acc, call, computed) => {
    if (call.options.validation && call.options.validation !== "0") {
        acc.validations = [
            ...acc.validations,
            {
                id: call.options.validation,
            },
        ];
    }
    const usedComputed = computed.filter((computed, index) => {
        return call.isComputedUsed(computed.id, index);
    });
    usedComputed.forEach((computed) => {
        // Check if the computed was already added. If yes, skip
        if (acc.computed.find((accComputed) => accComputed.id === computed.id))
            return;
        acc.computed = [
            ...acc.computed,
            {
                id: computed.id,
            },
        ];
    });
};
exports.manageValidationAndComputed = manageValidationAndComputed;
//# sourceMappingURL=transactionTrace.js.map