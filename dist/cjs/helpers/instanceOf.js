"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstanceOf = void 0;
class InstanceOf {
    static Variable = (object) => {
        return typeof object === "object" && "type" in object && "id" in object;
    };
    static TupleArray = (value, param) => {
        return (param.customType || param.type.includes("tuple")) && param.type.lastIndexOf("[") > 0;
    };
    static Tuple = (value, param) => {
        return (param.customType || param.type.includes("tuple")) && param.type.lastIndexOf("[") === -1;
    };
    static CallWithPlugin = (object) => {
        return typeof object === "object" && "plugin" in object;
    };
    static ValidationVariable = (object) => {
        return typeof object === "object" && "type" in object && object.type === "validation" && "id" in object;
    };
    static Param = (data) => {
        return Array.isArray(data) && typeof data[0] === "object" && "type" in data[0] && "name" in data[0];
    };
    static ParamArray = (data) => {
        return Array.isArray(data) && InstanceOf.Param(data[0]);
    };
    static ComputedVariable = (object) => {
        return typeof object === "object" && "type" in object && object.type === "computed" && "id" in object;
    };
}
exports.InstanceOf = InstanceOf;
//# sourceMappingURL=instanceOf.js.map