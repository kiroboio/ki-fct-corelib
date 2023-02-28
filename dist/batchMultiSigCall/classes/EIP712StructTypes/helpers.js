"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isInstanceOfTuple = exports.isInstanceOfTupleArray = void 0;
// Create a function that checks if the param type last index of [ is greater than 0. If true - value is Param[][] else - value is Param[]
const isInstanceOfTupleArray = (value, param) => {
    return (param.customType ?? false) && param.type.lastIndexOf("[") > 0;
};
exports.isInstanceOfTupleArray = isInstanceOfTupleArray;
const isInstanceOfTuple = (value, param) => {
    return (param.customType ?? false) && param.type.lastIndexOf("[") === -1;
};
exports.isInstanceOfTuple = isInstanceOfTuple;
