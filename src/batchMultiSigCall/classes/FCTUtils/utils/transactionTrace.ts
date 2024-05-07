import { Interfaces } from "../../../../helpers/Interfaces";
import { Call } from "../../Call";
import { IComputed } from "../../Variables/types";
import { ITxTrace } from "../types";

const batchMultiSigInterface = Interfaces.FCT_BatchMultiSigCall;
const controllerInterface = Interfaces.FCT_Controller;

export function getCallsFromTrace(trace: any) {
  return trace.filter((call) => {
    return (
      call.traceAddress.length === 7 &&
      call.traceAddress[0] === 0 &&
      call.traceAddress[1] === 0 &&
      call.traceAddress[3] === 0 &&
      call.traceAddress[4] === 0 &&
      call.traceAddress[5] === 2 &&
      call.traceAddress[6] === 2
    );
  });
}

export function getTraceData({
  calls,
  callsFromTenderlyTrace,
  executedCalls,
  computedVariables,
}: {
  calls: Call[];
  callsFromTenderlyTrace: any[];
  executedCalls: {
    id: any;
    caller: any;
    callIndex: any;
    isSuccess: boolean;
  }[];
  computedVariables: IComputed[];
}) {
  return executedCalls.reduce(
    (acc, executedCall, index) => {
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

      manageValidationAndComputed(acc, fctCall, computedVariables);

      return acc;
    },
    {
      calls: [],
      validations: [],
      computed: [],
    } as ITxTrace,
  ) as ITxTrace;
}

export const verifyMessageHash = (logs: any[], messageHas: string) => {
  const rawLogs = logs.map((log) => log.raw);
  return verifyMessageHashRaw(rawLogs, messageHas);
};

export const verifyMessageHashRaw = (logs: any[], messageHashFromFCT: string) => {
  const messageHash = logs.find((log) => {
    try {
      return controllerInterface.parseLog(log).name === "FCTE_Registered";
    } catch (e) {
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

export const txTraceMapLog = (log: any) => {
  const parsedLog = batchMultiSigInterface.parseLog(log);
  return {
    id: parsedLog.args.id,
    caller: parsedLog.args.caller,
    callIndex: parsedLog.args.callIndex.toString(),
    isSuccess: parsedLog.name === "FCTE_CallSucceed",
  };
};

export const executedCallsFromLogs = (logs: any[], messageHash: string) => {
  const rawLogs = logs.map((log) => log.raw);
  return executedCallsFromRawLogs(rawLogs, messageHash);
};

export const executedCallsFromRawLogs = (rawLogs: any[], messageHash: string) => {
  verifyMessageHashRaw(rawLogs, messageHash);

  return rawLogs
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
