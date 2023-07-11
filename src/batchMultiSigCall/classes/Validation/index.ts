import { ValidationBase, ValidationOperator } from "../../../constants";
import { InstanceOf } from "../../../helpers";
import { Variable } from "../../../types";
import { BatchMultiSigCall } from "../../batchMultiSigCall";
import { FCTBase } from "../FCTBase";
import { IValidation, IValidationData, IValidationEIP712, ValidationVariable } from "./types";

export class Validation extends FCTBase {
  protected _validations: Required<IValidation>[] = [];

  constructor(FCT: BatchMultiSigCall) {
    super(FCT);
  }

  public get() {
    return this._validations;
  }

  public getForEIP712(): IValidationEIP712[] {
    return this._validations.map((c, i) => ({
      index: (i + 1).toString(),
      value_1: this.handleVariable(c.value1, i),
      op: c.operator,
      value_2: this.handleVariable(c.value2, i),
    }));
  }

  public getForData(): IValidationData[] {
    return this._validations.map((c, i) => ({
      value1: this.handleVariable(c.value1, i),
      operator: ValidationOperator[c.operator],
      value2: this.handleVariable(c.value2, i),
    }));
  }

  public getIndex(id: string) {
    const index = this._validations.findIndex((v) => v.id === id);
    if (index === -1) throw new Error(`Validation with id ${id} not found`);
    return index + 1;
  }

  public add({ nodeId, validation }: { nodeId: string; validation: IValidation }): ValidationVariable {
    const call = this.FCT.getCallByNodeId(nodeId);
    const id = validation.id || this._validations.length.toString();
    this._validations.push({
      ...validation,
      id,
    });

    call.setOptions({
      validation: id,
    });

    return { type: "validation", id };
  }

  private handleVariable(value: string | Variable | ValidationVariable, index: number) {
    if (InstanceOf.ValidationVariable(value)) {
      const outputIndexHex = (index + 1).toString(16).padStart(4, "0");

      return outputIndexHex.padStart(ValidationBase.length, ValidationBase);
    }
    if (InstanceOf.Variable(value)) {
      return this.FCT.variables.getVariable(value, "uint256");
    }
    return value;
  }
}
