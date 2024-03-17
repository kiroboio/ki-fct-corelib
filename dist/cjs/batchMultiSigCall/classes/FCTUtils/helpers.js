"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.manageValidationAndComputed = exports.executedCallsFromLogs = exports.txTraceMapLog = exports.verifyMessageHash = void 0;
const Interfaces_1 = require("../../../helpers/Interfaces");
const batchMultiSigInterface = Interfaces_1.Interfaces.FCT_BatchMultiSigCall;
const controllerInterface = Interfaces_1.Interfaces.FCT_Controller;
const verifyMessageHash = (logs, messageHashFromFCT) => {
    const messageHash = logs.find((log) => {
        try {
            return controllerInterface.parseLog(log).name === "FCTE_Registered";
        }
        catch (e) {
            return false;
        }
    })?.topics[2];
    if (messageHash !== messageHashFromFCT) {
        throw new Error("Message hash mismatch");
    }
    return true;
};
exports.verifyMessageHash = verifyMessageHash;
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
const executedCallsFromLogs = (logs) => {
    return logs
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
exports.executedCallsFromLogs = executedCallsFromLogs;
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
//# sourceMappingURL=helpers.js.map