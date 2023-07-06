import { BatchMultiSigCall } from "../batchMultiSigCall";
import { IBatchMultiSigCallFCT } from "../types";

export function isValidNotification(fct: IBatchMultiSigCallFCT): boolean | Error {
  const FCT = BatchMultiSigCall.from(fct);
  const calls = FCT.calls;
  for (const call of calls) {
    if (call.options.payerIndex !== 0) {
      throw new Error(`payerIndex must be 0 for notification`);
    }
    if (call.options.callType !== "VIEW_ONLY") {
      throw new Error(`callType must be view only for notification`);
    }
  }

  return true;
}
