import { Interfaces } from "../../../helpers/Interfaces";
const batchMultiSigInterface = Interfaces.FCT_BatchMultiSigCall;
const controllerInterface = Interfaces.FCT_Controller;
export const verifyMessageHash = (logs, messageHashFromFCT) => {
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
export const txTraceMapLog = (log) => {
    const parsedLog = batchMultiSigInterface.parseLog(log);
    return {
        id: parsedLog.args.id,
        caller: parsedLog.args.caller,
        callIndex: parsedLog.args.callIndex.toString(),
        isSuccess: parsedLog.name === "FCTE_CallSucceed",
    };
};
export const executedCallsFromLogs = (logs) => {
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
        .map(txTraceMapLog);
};
export const manageValidationAndComputed = (acc, call, computed) => {
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
//# sourceMappingURL=helpers.js.map