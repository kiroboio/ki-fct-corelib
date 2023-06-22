import { ethers, utils } from "ethers";

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
import { Variable } from "../../../types";
import { globalVariables } from "../../../variables";
import { BatchMultiSigCall } from "../../batchMultiSigCall";
import { FCTBase } from "../FCTBase";
import { ComputedOperators } from "./computedConstants";
import { IComputed, IComputedData, IComputedEIP712 } from "./types";

export class Variables extends FCTBase {
  protected _computed: Required<IComputed>[] = [];

  constructor(FCT: BatchMultiSigCall) {
    super(FCT);
  }

  get computed() {
    return this._computed;
  }

  get computedAsData(): IComputedData[] {
    return this._computed.map((c) => ({
      values: [c.value1, c.value2, c.value3, c.value4].map((value) => {
        if (InstanceOf.Variable(value)) {
          return this.getVariable(value, "uint256");
        }
        return value;
      }) as [string, string, string, string],
      operators: [c.operator1, c.operator2, c.operator3].map((operator) => {
        return ethers.utils.id(operator);
      }) as [string, string, string],
      overflowProtection: c.overflowProtection,
    }));
  }

  get computedForEIP712(): IComputedEIP712[] {
    const handleVariable = (value: string | Variable) => {
      if (InstanceOf.Variable(value)) {
        return this.getVariable(value, "uint256");
      }
      return value;
    };
    return this._computed.map((c, i) => ({
      index: (i + 1).toString(),
      value_1: handleVariable(c.value1),
      op_1: c.operator1,
      value_2: handleVariable(c.value2),
      op_2: c.operator2,
      value_3: handleVariable(c.value3),
      op_3: c.operator3,
      value_4: handleVariable(c.value4),
      overflow_protection: c.overflowProtection,
    }));
  }

  public addComputed(computed: Partial<IComputed>): Variable & { type: "computed" } {
    // Add the computed value to the batch call.
    const defaultValue = "0";
    const defaultOperator = ComputedOperators.ADD;
    const data = {
      id: computed.id || this._computed.length.toString(),
      value1: computed.value1 || defaultValue,
      operator1: computed.operator1 || defaultOperator,
      value2: computed.value2 || defaultValue,
      operator2: computed.operator2 || defaultOperator,
      value3: computed.value3 || defaultValue,
      operator3: computed.operator2 || defaultOperator,
      value4: computed.value4 || defaultValue,
      overflowProtection: computed.overflowProtection || true,
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
