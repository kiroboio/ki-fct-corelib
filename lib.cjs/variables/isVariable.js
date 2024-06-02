"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isOutputVariable = exports.isComputedVariable = exports.isExternalVariable = void 0;
const constants_1 = require("../constants");
const helpers_1 = require("../helpers");
function isExternalVariable(value) {
    if (helpers_1.InstanceOf.Variable(value)) {
        return value.type === "external";
    }
    if (typeof value === "string" && (value.length === 42 || value.length === 66)) {
        const hexString = value.toLowerCase();
        const base = value.length === 42 ? constants_1.ExternalVariableBaseAddress.toLowerCase() : constants_1.ExternalVariableBaseBytes32.toLowerCase();
        return hexString.slice(0, -4) === base.slice(0, -4);
    }
    return false;
}
exports.isExternalVariable = isExternalVariable;
function isComputedVariable({ value, id, index, strict = false }) {
    if (helpers_1.InstanceOf.Variable(value)) {
        return value.id === id;
    }
    if (typeof value === "string" && (value.length === 42 || value.length === 66)) {
        const hexString = value.toLowerCase();
        const base = value.length === 42 ? constants_1.ComputedBaseAddress.toLowerCase() : constants_1.ComputedBaseBytes32.toLowerCase();
        if (hexString.slice(0, -4) === base.slice(0, -4)) {
            if (!strict)
                return true;
            const parsedIndex = parseInt(hexString.slice(-4), 16).toString();
            return parsedIndex === (index + 1).toString();
        }
    }
    return false;
}
exports.isComputedVariable = isComputedVariable;
function isOutputVariable({ value, index }) {
    if (helpers_1.InstanceOf.Variable(value)) {
        return value.type === "output";
    }
    if (typeof value === "string" && (value.length === 42 || value.length === 66)) {
        const hexString = value.toLowerCase();
        const base = value.length === 42 ? constants_1.ExternalVariableBaseAddress.toLowerCase() : constants_1.ExternalVariableBaseBytes32.toLowerCase();
        if (hexString.slice(0, -8) === base.slice(0, -8)) {
            const parsedIndex = parseInt(hexString.slice(-4), 16).toString();
            return parsedIndex === (index + 1).toString();
        }
    }
    return false;
}
exports.isOutputVariable = isOutputVariable;
//# sourceMappingURL=isVariable.js.map