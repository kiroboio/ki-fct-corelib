import { Interfaces } from "../../../helpers/Interfaces";
import { Call } from "../Call";
import { IComputed } from "../Variables/types";

const batchMultiSigInterface = Interfaces.FCT_BatchMultiSigCall;
const controllerInterface = Interfaces.FCT_Controller;

export const verifyMessageHash = (logs: any[], messageHashFromFCT: string) => {
  console.log("logs", logs);
  const messageHash = logs.find((log) => {
    try {
      return controllerInterface.parseLog(log).name === "FCTE_Registered";
    } catch (e) {
      return false;
    }
  })?.topics[2];

  if (messageHash !== messageHashFromFCT) {
    throw new Error("Message hash mismatch");
  }

  return true;
};

export const txTraceMapLog = (log: any) => {
  const parsedLog = batchMultiSigInterface.parseLog(log);
  return {
    id: parsedLog.args.id,
    caller: parsedLog.args.caller,
    callIndex: parsedLog.args.callIndex.toString(),
    isSuccess: parsedLog.name === "FCTE_CallSucceed",
  };
};

export const executedCallsFromLogs = (logs: any[]) => {
  return logs
    .filter((log) => {
      try {
        return (
          batchMultiSigInterface.parseLog(log).name === "FCTE_CallSucceed" ||
          batchMultiSigInterface.parseLog(log).name === "FCTE_CallFailed"
        );
      } catch (e) {
        return false;
      }
    })
    .map(txTraceMapLog);
};

export const manageValidationAndComputed = (acc: any, call: Call, computed: IComputed[]) => {
  if (call.options.validation && call.options.validation !== "0") {
    acc.validations = [
      ...acc.validations,
      {
        id: call.options.validation,
      },
    ];
  }

  const usedComputed = computed.filter((computed, index) => {
    return call.isComputedUsed(computed.id as string, index);
  });

  usedComputed.forEach((computed) => {
    // Check if the computed was already added. If yes, skip
    if (acc.computed.find((accComputed) => accComputed.id === computed.id)) return;

    acc.computed = [
      ...acc.computed,
      {
        id: computed.id as string,
      },
    ];
  });
};
