"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Variables = void 0;
const ethers_1 = require("ethers");
const __1 = require("../../..");
const helpers_1 = require("../../../helpers");
const variables_1 = require("../../../variables");
const FCTBase_1 = require("../FCTBase");
const computedConstants_1 = require("./computedConstants");
class Variables extends FCTBase_1.FCTBase {
    _computed = [];
    get computed() {
        return this._computed;
    }
    get computedAsData() {
        return this._computed.map((c) => ({
            values: [c.value1, c.value2, c.value3, c.value4].map((value) => {
                if (helpers_1.InstanceOf.Variable(value)) {
                    return this.getVariable(value, "uint256");
                }
                return value;
            }),
            operators: [c.operator1, c.operator2, c.operator3].map((operator) => {
                return ethers_1.ethers.utils.id(operator);
            }),
            overflowProtection: c.overflowProtection,
        }));
    }
    get computedForEIP712() {
        const handleVariable = (value) => {
            if (helpers_1.InstanceOf.Variable(value)) {
                return this.getVariable(value, "uint256");
            }
            return value;
        };
        return this._computed.map((c, i) => ({
            index: (i + 1).toString(),
            value_1: handleVariable(c.value1),
            op_1: c.operator1,
            value_2: handleVariable(c.value2),
            op_2: c.operator2,
            value_3: handleVariable(c.value3),
            op_3: c.operator3,
            value_4: handleVariable(c.value4),
            overflow_protection: c.overflowProtection,
        }));
    }
    isExternalVariableUsed() {
        return this._computed.some((computed) => {
            return [computed.value1, computed.value2, computed.value3, computed.value4].some((value) => {
                if (helpers_1.InstanceOf.Variable(value)) {
                    return value.type === "external";
                }
                if (typeof value === "string" && (value.length === 42 || value.length === 66)) {
                    const hexString = value.toLowerCase();
                    return hexString.startsWith("0xfc0000");
                }
                return false;
            });
        });
    }
    addComputed(computed) {
        // Add the computed value to the batch call.
        const defaultValue = "0";
        const defaultOperator = computedConstants_1.ComputedOperators.ADD;
        const data = {
            id: computed.id || this._computed.length.toString(),
            value1: computed.value1 || defaultValue,
            operator1: computed.operator1 || defaultOperator,
            value2: computed.value2 || defaultValue,
            operator2: computed.operator2 || defaultOperator,
            value3: computed.value3 || defaultValue,
            operator3: computed.operator2 || defaultOperator,
            value4: computed.value4 || defaultValue,
            overflowProtection: computed.overflowProtection || true,
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
            const index = this.FCT.calls.findIndex((call) => call.nodeId === id.nodeId);
            return this.getOutputVariable({
                index,
                innerIndex: id.innerIndex,
                type,
            });
        }
        if (variable.type === "global") {
            const id = variable.id;
            if (type.includes("bytes")) {
                // Check if id is in globalVariablesBytes
                if (!(id in variables_1.globalVariablesBytes)) {
                    throw new Error("Global variable not found");
                }
                return variables_1.globalVariablesBytes[id];
            }
            const globalVariable = variables_1.globalVariables[id];
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
    getOutputVariable({ index, innerIndex, type = "uint256", }) {
        return __1.variables.getOutputVariable({ index, innerIndex, type });
    }
    getExternalVariable(index, type) {
        return __1.variables.getExternalVariable({ index, type });
    }
    getComputedVariable(index, type) {
        return __1.variables.getComputedVariable({ index, type });
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
    getVariablesAsBytes32 = (variables) => {
        return Variables.getVariablesAsBytes32(variables);
    };
    static getVariablesAsBytes32 = (variables) => {
        return variables.map((v) => {
            if (isNaN(Number(v)) || ethers_1.utils.isAddress(v)) {
                return `0x${String(v).replace("0x", "").padStart(64, "0")}`;
            }
            return `0x${Number(v).toString(16).padStart(64, "0")}`;
        });
    };
}
exports.Variables = Variables;
//# sourceMappingURL=index.js.map