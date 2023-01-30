import { Variable } from "@types";

import {
  ComputedBase,
  ComputedBaseBytes,
  FCBase,
  FCBaseBytes,
  FDBackBase,
  FDBackBaseBytes,
  FDBase,
  FDBaseBytes,
} from "../../constants";
import { globalVariables } from "../../variables";
import { BatchMultiSigCall } from "../batchMultiSigCall";

export function getVariable(this: BatchMultiSigCall, variable: Variable, type: string) {
  if (variable.type === "external") {
    return this.getExternalVariable(variable.id as number, type);
  }
  if (variable.type === "output") {
    const id = variable.id as { nodeId: string; innerIndex: number };
    const indexForNode = this.calls.findIndex((call) => call.nodeId === id.nodeId);

    return this.getOutputVariable(indexForNode, id.innerIndex, type);
  }
  if (variable.type === "global") {
    const globalVariable = globalVariables[variable.id];

    if (!globalVariable) {
      throw new Error("Global variable not found");
    }

    return globalVariable;
  }
  if (variable.type === "computed") {
    const length = this.computedVariables.push({
      variable:
        typeof variable.id.variable === "string" ? variable.id.variable : this.getVariable(variable.id.variable, type),
      add: variable.id.add || "",
      sub: variable.id.sub || "",
      mul: variable.id.mul || "",
      div: variable.id.div || "",
    });
    const index = length - 1;

    return this.getComputedVariable(index, type);
  }

  throw new Error("Variable type not found");
}

export function getOutputVariable(this: BatchMultiSigCall, index: number, innerIndex: number, type: string) {
  const outputIndexHex = (index + 1).toString(16).padStart(4, "0");
  let base: string;
  let innerIndexHex: string;
  innerIndex = innerIndex ?? 0;

  if (innerIndex < 0) {
    innerIndexHex = ((innerIndex + 1) * -1).toString(16).padStart(4, "0");
    if (type.includes("bytes")) {
      base = FDBackBaseBytes;
    } else {
      base = FDBackBase;
    }
  } else {
    innerIndexHex = innerIndex.toString(16).padStart(4, "0");
    if (type.includes("bytes")) {
      base = FDBaseBytes;
    } else {
      base = FDBase;
    }
  }

  return (innerIndexHex + outputIndexHex).padStart(base.length, base);
}

export function getExternalVariable(this: BatchMultiSigCall, index: number, type: string) {
  const outputIndexHex = (index + 1).toString(16).padStart(4, "0");

  if (type.includes("bytes")) {
    return outputIndexHex.padStart(FCBaseBytes.length, FCBaseBytes);
  }

  return outputIndexHex.padStart(FCBase.length, FCBase);
}

export function getComputedVariable(this: BatchMultiSigCall, index: number, type: string) {
  const outputIndexHex = (index + 1).toString(16).padStart(4, "0");

  if (type.includes("bytes")) {
    return outputIndexHex.padStart(ComputedBaseBytes.length, ComputedBaseBytes);
  }

  return outputIndexHex.padStart(ComputedBase.length, ComputedBase);
}
