import { ValidationBase, ValidationOperator } from "../../../constants";
import { InstanceOf } from "../../../helpers";
import { Variable } from "../../../types";
import { FCTBase } from "../FCTBase";
import { IValidation, IValidationData, IValidationEIP712, ValidationAddResult, ValidationVariable } from "./types";

export class Validation extends FCTBase {
  protected _validations: Required<IValidation<false>>[] = [];

  public get() {
    return this._validations;
  }

  public isExternalVariableUsed() {
    return this._validations.some((validation) => {
      return [validation.value1, validation.value2].some((value) => {
        if (InstanceOf.Variable(value)) {
          return value.type === "external";
        }

        if (typeof value === "string" && (value.length === 42 || value.length === 66)) {
          const hexString = value.toLowerCase();
          return hexString.startsWith("0xfc0000");
        }

        return false;
      });
    });
  }

  public getForEIP712(): IValidationEIP712[] {
    return this._validations.map((c, i) => ({
      index: (i + 1).toString(),
      value_1: this.handleVariable(c.value1),
      op: c.operator,
      value_2: this.handleVariable(c.value2),
    }));
  }

  public getForData(): IValidationData[] {
    return this._validations.map((c) => ({
      value1: this.handleVariable(c.value1),
      operator: ValidationOperator[c.operator],
      value2: this.handleVariable(c.value2),
    }));
  }

  public getIndex(id: string) {
    if (id === "0") return 0;
    const index = this._validations.findIndex((v) => v.id === id);
    if (index === -1) throw new Error(`Validation with id ${id} not found`);
    return index + 1;
  }

  public add<V extends IValidation<true>>({
    nodeId,
    validation,
  }: {
    nodeId: string;
    validation: V;
  }): ValidationAddResult<V> {
    const call = this.FCT.getCallByNodeId(nodeId);

    const id = this.addValidation(validation);

    call.setOptions({
      validation: id,
    });

    return { type: "validation", id };
  }

  public addValidation(validation: IValidation<true>) {
    if (this.isIValidation(validation.value1)) {
      const id = this.addValidation(validation.value1);
      validation.value1 = { type: "validation", id };
    }

    if (this.isIValidation(validation.value2)) {
      const id = this.addValidation(validation.value2);
      validation.value2 = { type: "validation", id };
    }

    const id = validation.id || (this._validations.length + 1).toString();

    // Check if the validation id is already used
    if (this._validations.some((v) => v.id === id)) throw new Error(`Validation with id ${id} already exists`);

    // if value1 or value2 is a string, check if it is a integer
    if (typeof validation.value1 === "string") {
      if (isNaN(parseInt(validation.value1, 10))) throw new Error(`Invalid value1 for validation ${id}`);
    }
    if (typeof validation.value2 === "string") {
      if (isNaN(parseInt(validation.value2, 10))) throw new Error(`Invalid value2 for validation ${id}`);
    }

    this._validations.push({
      value1: validation.value1,
      operator: validation.operator,
      value2: validation.value2,
      id,
    } as Required<IValidation<false>>);

    return id;
  }

  private handleVariable(value: string | Variable | ValidationVariable) {
    if (InstanceOf.ValidationVariable(value)) {
      const index = this.getIndex(value.id);
      const outputIndexHex = index.toString(16).padStart(4, "0");

      return outputIndexHex.padStart(ValidationBase.length, ValidationBase);
    }
    if (InstanceOf.Variable(value)) {
      return this.FCT.variables.getVariable(value, "uint256");
    }
    return value;
  }

  private isIValidation(value: any): value is IValidation<true> {
    return typeof value === "object" && value !== null && "value1" in value && "operator" in value && "value2" in value;
  }
}
