"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.valueNotUndefined = exports.instanceOfParams = exports.instanceOfVariable = void 0;
const instanceOfVariable = (object) => {
    return typeof object === "object" && "type" in object && "id" in object;
};
exports.instanceOfVariable = instanceOfVariable;
function instanceOfParams(objectOrArray) {
    if (Array.isArray(objectOrArray)) {
        return instanceOfParams(objectOrArray[0]);
    }
    return typeof objectOrArray === "object" && "type" in objectOrArray && "name" in objectOrArray;
}
exports.instanceOfParams = instanceOfParams;
function valueNotUndefined(value) {
    return value !== undefined;
}
exports.valueNotUndefined = valueNotUndefined;
