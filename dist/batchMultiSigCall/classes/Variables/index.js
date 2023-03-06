"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Variables = void 0;
const constants_1 = require("../../../constants");
const helpers_1 = require("../../../helpers");
const variables_1 = require("../../../variables");
const FCTBase_1 = require("../FCTBase");
class Variables extends FCTBase_1.FCTBase {
    constructor(FCT) {
        super(FCT);
        this._computed = [];
    }
    get computed() {
        return this._computed;
    }
    get computedWithValues() {
        const handleVariable = (value) => {
            if ((0, helpers_1.instanceOfVariable)(value)) {
                return this.getVariable(value, "uint256");
            }
            return value;
        };
        return this._computed.map((c, i) => ({
            index: (i + 1).toString(),
            value: handleVariable(c.value),
            add: handleVariable(c.add),
            sub: handleVariable(c.sub),
            mul: handleVariable(c.mul),
            pow: handleVariable(c.pow),
            div: handleVariable(c.div),
            mod: handleVariable(c.mod),
        }));
    }
    addComputed(computed) {
        // Add the computed value to the batch call.
        const data = {
            id: computed.id || this._computed.length.toString(),
            value: computed.value,
            add: computed.add || "0",
            sub: computed.sub || "0",
            mul: computed.mul || "1",
            pow: computed.pow || "1",
            div: computed.div || "1",
            mod: computed.mod || "0",
        };
        this._computed.push(data);
        // Return the variable representing the computed value.
        return {
            type: "computed",
            id: data.id,
        };
    }
    getVariable(variable, type) {
        if (variable.type === "external") {
            return this.getExternalVariable(variable.id, type);
        }
        if (variable.type === "output") {
            const id = variable.id;
            const indexForNode = this.FCT.calls.findIndex((call) => call.nodeId === id.nodeId);
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
            const computedVariables = this.computed;
            const index = computedVariables.findIndex((computedVariable) => {
                return computedVariable.id === variable.id;
            });
            return this.getComputedVariable(index, type);
        }
        throw new Error("Variable type not found");
    }
    getOutputVariable(index, innerIndex, type) {
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
    getExternalVariable(index, type) {
        const outputIndexHex = (index + 1).toString(16).padStart(4, "0");
        if (type.includes("bytes")) {
            return outputIndexHex.padStart(constants_1.FCBaseBytes.length, constants_1.FCBaseBytes);
        }
        return outputIndexHex.padStart(constants_1.FCBase.length, constants_1.FCBase);
    }
    getComputedVariable(index, type) {
        const outputIndexHex = (index + 1).toString(16).padStart(4, "0");
        if (type.includes("bytes")) {
            return outputIndexHex.padStart(constants_1.ComputedBaseBytes.length, constants_1.ComputedBaseBytes);
        }
        return outputIndexHex.padStart(constants_1.ComputedBase.length, constants_1.ComputedBase);
    }
    getValue(value, type, ifValueUndefined = "") {
        if (!value) {
            return ifValueUndefined;
        }
        if (typeof value === "string") {
            return value;
        }
        return this.getVariable(value, type);
    }
}
exports.Variables = Variables;
