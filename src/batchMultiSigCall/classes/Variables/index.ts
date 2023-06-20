import { utils } from "ethers";

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
import { InstanceOf } from "../../../helpers";
import { IValidationEIP712, Variable } from "../../../types";
import { globalVariables } from "../../../variables";
import { BatchMultiSigCall } from "../../batchMultiSigCall";
import { IComputed } from "../../types";
import { FCTBase } from "../FCTBase";

export class Variables extends FCTBase {
  protected _computed: Required<IComputed>[] = [];
  protected _validation: Required<IValidationEIP712>[] = [];

  constructor(FCT: BatchMultiSigCall) {
    super(FCT);
  }

  get computed() {
    return this._computed;
  }

  get computedWithValues() {
    const handleVariable = (value: string | Variable) => {
      if (InstanceOf.Variable(value)) {
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

  public addValidation(validation: IValidationEIP712): Variable & { type: "validation" } {
    const id = validation.id || this._validation.length.toString();
    this._validation.push({
      ...validation,
      id,
    });

    return {
      type: "validation",
      id,
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

  private getOutputVariable({
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

  private getExternalVariable(index: number, type: string) {
    const outputIndexHex = (index + 1).toString(16).padStart(4, "0");

    if (type.includes("bytes")) {
      return outputIndexHex.padStart(FCBaseBytes.length, FCBaseBytes);
    }

    return outputIndexHex.padStart(FCBase.length, FCBase);
  }

  private getComputedVariable(index: number, type: string) {
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

  public getVariablesAsBytes32 = (variables: string[]) => {
    return Variables.getVariablesAsBytes32(variables);
  };

  static getVariablesAsBytes32 = (variables: string[]) => {
    return variables.map((v) => {
      if (isNaN(Number(v)) || utils.isAddress(v)) {
        return `0x${String(v).replace("0x", "").padStart(64, "0")}`;
      }

      return `0x${Number(v).toString(16).padStart(64, "0")}`;
    });
  };
}
