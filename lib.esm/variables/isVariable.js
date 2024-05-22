import { ComputedBaseAddress, ComputedBaseBytes32, ExternalVariableBaseAddress, ExternalVariableBaseBytes32, } from "../constants";
import { InstanceOf } from "../helpers";
export function isExternalVariable(value) {
    if (InstanceOf.Variable(value)) {
        return value.type === "external";
    }
    if (typeof value === "string" && (value.length === 42 || value.length === 66)) {
        const hexString = value.toLowerCase();
        const base = value.length === 42 ? ExternalVariableBaseAddress.toLowerCase() : ExternalVariableBaseBytes32.toLowerCase();
        return hexString.slice(0, -4) === base.slice(0, -4);
    }
    return false;
}
export function isComputedVariable({ value, id, index, strict = false }) {
    if (InstanceOf.Variable(value)) {
        return value.id === id;
    }
    if (typeof value === "string" && (value.length === 42 || value.length === 66)) {
        const hexString = value.toLowerCase();
        const base = value.length === 42 ? ComputedBaseAddress.toLowerCase() : ComputedBaseBytes32.toLowerCase();
        if (hexString.slice(0, -4) === base.slice(0, -4)) {
            if (!strict)
                return true;
            const parsedIndex = parseInt(hexString.slice(-4), 16).toString();
            return parsedIndex === (index + 1).toString();
        }
    }
    return false;
}
export function isOutputVariable({ value, index }) {
    if (InstanceOf.Variable(value)) {
        return value.type === "output";
    }
    if (typeof value === "string" && (value.length === 42 || value.length === 66)) {
        const hexString = value.toLowerCase();
        const base = value.length === 42 ? ExternalVariableBaseAddress.toLowerCase() : ExternalVariableBaseBytes32.toLowerCase();
        if (hexString.slice(0, -8) === base.slice(0, -8)) {
            const parsedIndex = parseInt(hexString.slice(-4), 16).toString();
            return parsedIndex === (index + 1).toString();
        }
    }
    return false;
}
//# sourceMappingURL=isVariable.js.map