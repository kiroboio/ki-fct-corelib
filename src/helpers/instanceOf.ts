import { ValidationVariable } from "../batchMultiSigCall/classes/Validation/types";
import { IWithPlugin, Param, Variable } from "../types";

export class InstanceOf {
  static Variable = (object: any): object is Variable => {
    return typeof object === "object" && "type" in object && "id" in object;
  };

  static TupleArray = (value: Param["value"], param: Param): value is Param[][] => {
    return (param.customType || param.type.includes("tuple")) && param.type.lastIndexOf("[") > 0;
  };

  static Tuple = (value: Param["value"], param: Param): value is Param[] => {
    return (param.customType || param.type.includes("tuple")) && param.type.lastIndexOf("[") === -1;
  };

  static CallWithPlugin = (object: any): object is IWithPlugin => {
    return typeof object === "object" && "plugin" in object;
  };

  static ValidationVariable = (object: any): object is ValidationVariable => {
    return typeof object === "object" && "type" in object && object.type === "validation" && "id" in object;
  };
}
