import { IMSCallWithEncodedData, IWithPlugin, Param, Variable } from "../types";

export class InstanceOf {
  static Variable = (object: any): object is Variable => {
    return typeof object === "object" && "type" in object && "id" in object;
  };

  static Param = (objectOrArray: any): objectOrArray is Param[] => {
    return (
      Array.isArray(objectOrArray) &&
      typeof objectOrArray[0] === "object" &&
      "type" in objectOrArray[0] &&
      "name" in objectOrArray[0]
    );
  };

  static ParamArray = (object: any): object is Param[][] => {
    return Array.isArray(object) && InstanceOf.Param(object[0]);
  };

  static IWithPlugin = (object: any): object is IWithPlugin => {
    return typeof object === "object" && "plugin" in object;
  };

  static IMSCallWithEncodedData = (object: any): object is IMSCallWithEncodedData => {
    return typeof object === "object" && "abi" in object;
  };
}
