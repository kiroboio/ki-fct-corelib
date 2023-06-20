import { IWithPlugin, Param, Variable } from "../types";

// export const instanceOfVariable = (object: any): object is Variable => {
//   return typeof object === "object" && "type" in object && "id" in object;
// };
//
// export function instanceOfParams(objectOrArray: any): objectOrArray is Param | Param[] {
//   if (Array.isArray(objectOrArray)) {
//     return instanceOfParams(objectOrArray[0]);
//   }
//
//   return typeof objectOrArray === "object" && "type" in objectOrArray && "name" in objectOrArray;
// }

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
}
