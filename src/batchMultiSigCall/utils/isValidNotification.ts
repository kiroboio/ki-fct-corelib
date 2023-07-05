import { BatchMultiSigCall } from "../batchMultiSigCall";
import { IBatchMultiSigCallFCT } from "../types";

export function isValidNotification(fct: IBatchMultiSigCallFCT): boolean | Error {
  const FCT = BatchMultiSigCall.from(fct);
  const calls = FCT.calls;
  for (const call of calls) {
    if (call.options.payerIndex !== 0) {
      throw new Error(`CallID.payerIndex must be 0 for notification`);
    }
  }

  return true;
}
