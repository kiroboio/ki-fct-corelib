import {
  ComputedBase,
  ComputedBaseBytes,
  FCBase,
  FCBaseBytes,
  FDBackBase,
  FDBackBaseBytes,
  FDBase,
  FDBaseBytes,
} from "../../../constants";
import { instanceOfVariable } from "../../../helpers";
import { Variable } from "../../../types";
import { globalVariables } from "../../../variables";
import { BatchMultiSigCall } from "../../batchMultiSigCall";
import { IComputed } from "../../types";
import { FCTBase } from "../FCTBase";

export class Variables extends FCTBase {
  public _computed: Required<IComputed>[] = [];

  constructor(FCT: BatchMultiSigCall) {
    super(FCT);
  }

  get computed() {
    return this._computed;
  }

  get computedWithValues() {
    const handleVariable = (value: string | Variable) => {
      if (instanceOfVariable(value)) {
        return this.getVariable(value, "uint256");
      }
      return value;
    };
    return this._computed.map((c, i) => ({
      index: (i + 1).toString(),
      value: handleVariable(c.value),
      add: handleVariable(c.add),
      sub: handleVariable(c.sub),
      mul: handleVariable(c.mul),
      pow: handleVariable(c.pow),
      div: handleVariable(c.div),
      mod: handleVariable(c.mod),
    }));
  }

  public addComputed(computed: IComputed): Variable & { type: "computed" } {
    // Add the computed value to the batch call.
    const data = {
      id: computed.id || this._computed.length.toString(),
      value: computed.value,
      add: computed.add || "0",
      sub: computed.sub || "0",
      mul: computed.mul || "1",
      pow: computed.pow || "1",
      div: computed.div || "1",
      mod: computed.mod || "0",
    };
    this._computed.push(data);

    // Return the variable representing the computed value.
    return {
      type: "computed",
      id: data.id,
    };
  }

  public getVariable(variable: Variable, type: string) {
    if (variable.type === "external") {
      return this.getExternalVariable(variable.id, type);
    }
    if (variable.type === "output") {
      const id = variable.id as { nodeId: string; innerIndex: number };
      const index = this.FCT.calls.findIndex((call) => call.nodeId === id.nodeId);

      return this.getOutputVariable({
        index,
        innerIndex: id.innerIndex,
        type,
      });
    }
    if (variable.type === "global") {
      const globalVariable = globalVariables[variable.id];

      if (!globalVariable) {
        throw new Error("Global variable not found");
      }

      return globalVariable;
    }
    if (variable.type === "computed") {
      const computedVariables = this.computed;
      const index = computedVariables.findIndex((computedVariable) => {
        return computedVariable.id === variable.id;
      });

      return this.getComputedVariable(index, type);
    }

    throw new Error("Variable type not found");
  }

  public getOutputVariable({
    index,
    innerIndex,
    type = "uint256",
  }: {
    index: number;
    innerIndex: number;
    type?: string;
  }) {
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

  public getExternalVariable(index: number, type: string) {
    const outputIndexHex = (index + 1).toString(16).padStart(4, "0");

    if (type.includes("bytes")) {
      return outputIndexHex.padStart(FCBaseBytes.length, FCBaseBytes);
    }

    return outputIndexHex.padStart(FCBase.length, FCBase);
  }

  public getComputedVariable(index: number, type: string) {
    const outputIndexHex = (index + 1).toString(16).padStart(4, "0");

    if (type.includes("bytes")) {
      return outputIndexHex.padStart(ComputedBaseBytes.length, ComputedBaseBytes);
    }

    return outputIndexHex.padStart(ComputedBase.length, ComputedBase);
  }

  public getValue(value: undefined | Variable | string, type: string, ifValueUndefined = ""): string {
    if (!value) {
      return ifValueUndefined;
    }
    if (typeof value === "string") {
      return value;
    }

    return this.getVariable(value, type);
  }
}
