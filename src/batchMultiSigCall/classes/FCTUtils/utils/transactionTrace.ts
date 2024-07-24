import { ethers } from "ethers";

import SmartWalletMinABI from "../../../../abi/SmartWallet.min.abi.json";
import { Interfaces } from "../../../../helpers/Interfaces";
import { getVersionFromVersion } from "../../../versions/getVersion";
import { Call } from "../../Call";
import { IComputed } from "../../Variables/types";
import { ITxTrace } from "../types";
// const batchMultiSigInterface = Interfaces.FCT_BatchMultiSigCall;
const controllerInterface = Interfaces.FCT_Controller;

const SmartWalletMinInterface = new ethers.utils.Interface(SmartWalletMinABI);

const getBatchMultiSigCallInterface = () => {
  const Version = getVersionFromVersion(`0x020201`);
  return Version.Utils.getBatchMultiSigCallABI();
};

export function getCallsFromTrace(trace: any) {
  return trace.filter((call) => {
    const regularCall =
      call.traceAddress.length === 7 &&
      call.traceAddress[0] === 0 &&
      call.traceAddress[1] === 0 &&
      call.traceAddress[3] === 0 &&
      call.traceAddress[4] === 0 &&
      call.traceAddress[5] === 2 &&
      call.traceAddress[6] === 2;

    const secureStorageCall =
      call.traceAddress.length === 3 &&
      call.traceAddress[0] === 0 &&
      call.traceAddress[1] === 0 &&
      call.traceAddress[2] === 2;
    return regularCall || secureStorageCall;
  });
}

export function getTraceData({
  FCT_BatchMultiSigAddress,
  calls,
  callsFromTenderlyTrace,
  executedCalls,
  computedVariables,
}: {
  FCT_BatchMultiSigAddress: string;
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
  FCT_BatchMultiSigAddress = FCT_BatchMultiSigAddress.toLowerCase();
  return executedCalls.reduce(
    (acc, executedCall, index) => {
      const fctCall = calls[Number(executedCall.callIndex) - 1];
      const callResult = callsFromTenderlyTrace[index];
      const input = callResult.input;
      const output = callResult.output;

      // If the from address is the FCT_BatchMultiSigAddress, then we
      // need to do a different decoding
      const callerIsBatchMultiSig = callResult.from.toLowerCase() === FCT_BatchMultiSigAddress;

      let resData;
      if (callerIsBatchMultiSig) {
        // Different way decoding, because this is

        // 1. Need to decode the input, because the input is fctCall function
        const decodedInput = SmartWalletMinInterface.parseTransaction({ data: input });
        console.log(decodedInput);

        // 2. We need to take the calldata from the arguments. It is stored in args.callData.data
        const calldata = decodedInput.args.callData.data;
        console.log(calldata);

        // 3. Decode the calldata
        const decodedCallData = fctCall.decodeData({
          inputData: calldata,
        });

        resData = decodedCallData;
      } else {
        resData = fctCall.decodeData({
          inputData: input,
          outputData: output,
        });
      }

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

  if (messageHash.toLowerCase() !== messageHashFromFCT.toLowerCase()) {
    throw new Error("Message hash mismatch");
  }

  return true;
};

export const txTraceMapLog = (log: any) => {
  const parsedLog = getBatchMultiSigCallInterface().parseLog(log);
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
          getBatchMultiSigCallInterface().parseLog(log).name === "FCTE_CallSucceed" ||
          getBatchMultiSigCallInterface().parseLog(log).name === "FCTE_CallFailed"
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
