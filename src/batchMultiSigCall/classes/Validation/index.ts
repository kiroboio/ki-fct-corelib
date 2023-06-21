import { ValidationBase, ValidationOperator } from "../../../constants";
import { InstanceOf } from "../../../helpers";
import { IValidationEIP712, Variable } from "../../../types";
import { BatchMultiSigCall } from "../../batchMultiSigCall";
import { FCTBase } from "../FCTBase";

interface ValidationVariable {
  type: "validation";
  id: string;
}

function instanceOfValidationVariable(object: any): object is ValidationVariable {
  return typeof object === "object" && "type" in object && object.type === "validation" && "id" in object;
}

export class Validation extends FCTBase {
  protected _validations: Required<IValidationEIP712>[] = [];

  constructor(FCT: BatchMultiSigCall) {
    super(FCT);
  }

  get get() {
    return this._validations;
  }

  public getIndex(id: string) {
    const index = this._validations.findIndex((v) => v.id === id);
    if (index === -1) throw new Error(`Validation with id ${id} not found`);
    return index;
  }

  public getWithValues(hashed = false) {
    return this._validations.map((c, i) => ({
      index: (i + 1).toString(),
      value1: this.handleVariable(c.value1, i),
      operator: hashed ? ValidationOperator[c.operator] : c.operator,
      value2: this.handleVariable(c.value2, i),
    }));
  }

  public add(validation: IValidationEIP712): ValidationVariable {
    const id = validation.id || this._validations.length.toString();
    this._validations.push({
      ...validation,
      id,
    });

    return { type: "validation", id };
  }

  public addAndSetForCall({ nodeId, validation }: { nodeId: string; validation: IValidationEIP712 }) {
    const call = this.FCT.getCallByNodeId(nodeId);
    const validationVariable = this.add(validation);
    call.setOptions({
      validation: validationVariable.id,
    });
  }

  private handleVariable(value: string | Variable | ValidationVariable, index: number) {
    if (instanceOfValidationVariable(value)) {
      const outputIndexHex = (index + 1).toString(16).padStart(4, "0");

      return outputIndexHex.padStart(ValidationBase.length, ValidationBase);
    }
    if (InstanceOf.Variable(value)) {
      return this.FCT.variables.getVariable(value, "uint256");
    }
    return value;
  }
}
