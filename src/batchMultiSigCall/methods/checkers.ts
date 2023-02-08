import { IMSCallInput } from "@types";

import { verifyParam } from "..//helpers";
import { BatchMultiSigCall } from "../batchMultiSigCall";

export function verifyCall(this: BatchMultiSigCall, call: IMSCallInput) {
  if (!call.to) {
    throw new Error("To address is required");
  }
  if (!call.from) {
    throw new Error("From address is required");
  }

  if (call.nodeId) {
    const index = this.calls.findIndex((item) => item.nodeId === call.nodeId);
    if (index > 0) {
      throw new Error(`Node ID ${call.nodeId} already exists, please use a different one`);
    }
  }

  if (call.params) {
    call.params.map(verifyParam);
  }
}
