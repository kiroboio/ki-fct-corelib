import { ValidationVariable } from "../batchMultiSigCall/classes/Validation/types";
import { IWithPlugin, Param, Variable } from "../types";

type PluginVariable = { name: "path"; type: "address[]"; value: any[] };
export class InstanceOf {
  static Variable = (object: any): object is Variable => {
    return typeof object === "object" && "type" in object && "id" in object;
  };

  static PluginVariable = (object: any): object is PluginVariable => {
    return typeof object === "object" && "type" in object && object.type === "address[]";
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

  static Param = (data: any): data is Param[] => {
    return Array.isArray(data) && typeof data[0] === "object" && "type" in data[0] && "name" in data[0];
  };

  static ParamArray = (data: any): data is Param[][] => {
    return Array.isArray(data) && InstanceOf.Param(data[0]);
  };

  static ComputedVariable = (object: any): object is { type: "computed"; id: string } => {
    return typeof object === "object" && "type" in object && object.type === "computed" && "id" in object;
  };
}
