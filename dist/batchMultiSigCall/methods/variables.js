"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getComputedVariable = exports.getExternalVariable = exports.getOutputVariable = exports.getVariable = void 0;
const constants_1 = require("../../constants");
const variables_1 = require("../../variables");
function getVariable(variable, type) {
    if (variable.type === "external") {
        return this.getExternalVariable(variable.id, type);
    }
    if (variable.type === "output") {
        const id = variable.id;
        const indexForNode = this.calls.findIndex((call) => call.nodeId === id.nodeId);
        return this.getOutputVariable(indexForNode, id.innerIndex, type);
    }
    if (variable.type === "global") {
        const globalVariable = variables_1.globalVariables[variable.id];
        if (!globalVariable) {
            throw new Error("Global variable not found");
        }
        return globalVariable;
    }
    if (variable.type === "computed") {
        const length = this.computedVariables.push({
            variable: typeof variable.id.variable === "string" ? variable.id.variable : this.getVariable(variable.id.variable, type),
            add: variable.id.add || "",
            sub: variable.id.sub || "",
            mul: variable.id.mul || "",
            div: variable.id.div || "",
        });
        const index = length - 1;
        return this.getComputedVariable(index, type);
    }
    throw new Error("Variable type not found");
}
exports.getVariable = getVariable;
function getOutputVariable(index, innerIndex, type) {
    const outputIndexHex = (index + 1).toString(16).padStart(4, "0");
    let base;
    let innerIndexHex;
    innerIndex = innerIndex ?? 0;
    if (innerIndex < 0) {
        innerIndexHex = ((innerIndex + 1) * -1).toString(16).padStart(4, "0");
        if (type.includes("bytes")) {
            base = constants_1.FDBackBaseBytes;
        }
        else {
            base = constants_1.FDBackBase;
        }
    }
    else {
        innerIndexHex = innerIndex.toString(16).padStart(4, "0");
        if (type.includes("bytes")) {
            base = constants_1.FDBaseBytes;
        }
        else {
            base = constants_1.FDBase;
        }
    }
    return (innerIndexHex + outputIndexHex).padStart(base.length, base);
}
exports.getOutputVariable = getOutputVariable;
function getExternalVariable(index, type) {
    const outputIndexHex = (index + 1).toString(16).padStart(4, "0");
    if (type.includes("bytes")) {
        return outputIndexHex.padStart(constants_1.FCBaseBytes.length, constants_1.FCBaseBytes);
    }
    return outputIndexHex.padStart(constants_1.FCBase.length, constants_1.FCBase);
}
exports.getExternalVariable = getExternalVariable;
function getComputedVariable(index, type) {
    const outputIndexHex = (index + 1).toString(16).padStart(4, "0");
    if (type.includes("bytes")) {
        return outputIndexHex.padStart(constants_1.ComputedBaseBytes.length, constants_1.ComputedBaseBytes);
    }
    return outputIndexHex.padStart(constants_1.ComputedBase.length, constants_1.ComputedBase);
}
exports.getComputedVariable = getComputedVariable;
