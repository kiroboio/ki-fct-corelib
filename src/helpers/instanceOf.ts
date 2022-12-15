import { Param, Variable } from "../types";

export const instanceOfVariable = (object: any): object is Variable => {
  return typeof object === "object" && "type" in object && "id" in object;
};

export function instanceOfParams(objectOrArray: any): objectOrArray is Param | Param[] {
  if (Array.isArray(objectOrArray)) {
    return instanceOfParams(objectOrArray[0]);
  }

  return typeof objectOrArray === "object" && "type" in objectOrArray && "name" in objectOrArray;
}
