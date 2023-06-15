import { Param } from "../../../../types";

// Create a function that checks if the param type last index of [ is greater than 0. If true - value is Param[][] else - value is Param[]
export const isInstanceOfTupleArray = (value: Param["value"], param: Param): value is Param[][] => {
  return (param.customType ?? false) && param.type.lastIndexOf("[") > 0;
};

export const isInstanceOfTuple = (value: Param["value"], param: Param): value is Param[] => {
  return (param.customType ?? false) && param.type.lastIndexOf("[") === -1;
};
