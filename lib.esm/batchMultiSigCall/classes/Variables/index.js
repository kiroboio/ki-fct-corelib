import { ethers, utils } from "ethers";
import { variables } from "../../..";
import { InstanceOf } from "../../../helpers";
import { globalVariables, globalVariablesBytes } from "../../../variables";
import { FCTBase } from "../FCTBase";
import { ComputedOperators } from "./computedConstants";
export class Variables extends FCTBase {
    _computed = [];
    constructor(FCT) {
        super(FCT);
    }
    get computed() {
        return this._computed;
    }
    get computedAsData() {
        return this._computed.map((c) => ({
            values: [c.value1, c.value2, c.value3, c.value4].map((value) => {
                if (InstanceOf.Variable(value)) {
                    return this.getVariable(value, "uint256");
                }
                return value;
            }),
            operators: [c.operator1, c.operator2, c.operator3].map((operator) => {
                return ethers.utils.id(operator);
            }),
            overflowProtection: c.overflowProtection,
        }));
    }
    get computedForEIP712() {
        const handleVariable = (value) => {
            if (InstanceOf.Variable(value)) {
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
    addComputed(computed) {
        // Add the computed value to the batch call.
        const defaultValue = "0";
        const defaultOperator = ComputedOperators.ADD;
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
                if (!(id in globalVariablesBytes)) {
                    throw new Error("Global variable not found");
                }
                return globalVariablesBytes[id];
            }
            const globalVariable = globalVariables[id];
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
        // const outputIndexHex = (index + 1).toString(16).padStart(4, "0");
        // let base: string;
        // let innerIndexHex: string;
        // innerIndex = innerIndex ?? 0;
        // if (innerIndex < 0) {
        //   innerIndexHex = ((innerIndex + 1) * -1).toString(16).padStart(4, "0");
        //   if (type.includes("bytes")) {
        //     base = FDBackBaseBytes;
        //   } else {
        //     base = FDBackBase;
        //   }
        // } else {
        //   innerIndexHex = innerIndex.toString(16).padStart(4, "0");
        //   if (type.includes("bytes")) {
        //     base = FDBaseBytes;
        //   } else {
        //     base = FDBase;
        //   }
        // }
        // return (innerIndexHex + outputIndexHex).padStart(base.length, base);
        return variables.getOutputVariable({ index, innerIndex, type });
    }
    getExternalVariable(index, type) {
        // const outputIndexHex = (index + 1).toString(16).padStart(4, "0");
        // if (type.includes("bytes")) {
        //   return outputIndexHex.padStart(FCBaseBytes.length, FCBaseBytes);
        // }
        // return outputIndexHex.padStart(FCBase.length, FCBase);
        return variables.getExternalVariable({ index, type });
    }
    getComputedVariable(index, type) {
        // const outputIndexHex = (index + 1).toString(16).padStart(4, "0");
        // if (type.includes("bytes")) {
        //   return outputIndexHex.padStart(ComputedBaseBytes.length, ComputedBaseBytes);
        // }
        // return outputIndexHex.padStart(ComputedBase.length, ComputedBase);
        return variables.getComputedVariable({ index, type });
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
            if (isNaN(Number(v)) || utils.isAddress(v)) {
                return `0x${String(v).replace("0x", "").padStart(64, "0")}`;
            }
            return `0x${Number(v).toString(16).padStart(64, "0")}`;
        });
    };
}
//# sourceMappingURL=index.js.map