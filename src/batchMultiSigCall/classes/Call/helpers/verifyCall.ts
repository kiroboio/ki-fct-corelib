import { CALL_TYPE } from "../../../../constants";
import { flows } from "../../../../constants/flows";
import { CallOptions } from "../../../../types";
import { BatchMultiSigCall } from "../../../batchMultiSigCall";
import { IMSCallInput } from "../../../types";
import { isAddress, isInteger, verifyParam } from "./verifyParam";

export function verifyCall({
  call,
  update = false,
  FCT,
}: {
  call: IMSCallInput;
  update?: boolean;
  FCT: BatchMultiSigCall;
}) {
  // To address validator
  if (!call.to) {
    throw new Error("To address is required");
  } else if (typeof call.to === "string") {
    isAddress(call.to, "To");
  }

  // Value validator
  if (call.value && typeof call.value === "string") {
    isInteger(call.value, "Value");
  }

  // Method validator
  if (call.method && call.method.length === 0) {
    throw new Error("Method cannot be empty string");
  }

  if (call.nodeId) validateNodeId({ nodeId: call.nodeId, update, FCT });
  if (call.options) validateCallOptions(call.options);

  if (call.params?.length) {
    if (!call.method) {
      throw new Error("Method is required when params are present");
    }

    call.params.forEach(verifyParam);
  }
}

function validateNodeId({ nodeId, update, FCT }: { nodeId: string; update: boolean; FCT: BatchMultiSigCall }) {
  let index: number;
  const FCTCalls = FCT.calls;
  if (update) {
    // If it is an update, we need to ignore the current node ID
    const currentCallIndex = FCT.getIndexByNodeId(nodeId);
    // Ignore the current node ID from this.calls;
    const calls = FCTCalls.filter((item, i) => i !== currentCallIndex);
    index = calls.findIndex((item) => item.nodeId === nodeId);
  } else {
    index = FCTCalls.findIndex((item) => item.nodeId === nodeId);
  }
  if (index > -1) {
    throw new Error(`Node ID ${nodeId} already exists, please use a different one`);
  }
}

function validateCallOptions(options: CallOptions) {
  const { gasLimit, callType, flow } = options;
  if (gasLimit) {
    isInteger(gasLimit, "Gas limit");
  }
  if (callType) {
    const keysOfCALLTYPE = Object.keys(CALL_TYPE);
    if (!keysOfCALLTYPE.includes(callType)) {
      throw new Error(`Call type ${callType} is not valid`);
    }
  }
  if (flow) {
    const keysOfFlow = Object.keys(flows);
    if (!keysOfFlow.includes(flow)) {
      throw new Error(`Flow ${flow} is not valid`);
    }
  }
}
