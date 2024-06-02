import { BackOutputVariableBaseAddress, BackOutputVariableBaseBytes32, ComputedBaseAddress, ComputedBaseBytes32, ExternalVariableBaseAddress, ExternalVariableBaseBytes32, OutputVariableBaseAddress, OutputVariableBaseBytes32, } from "../constants";
import { globalVariables, globalVariablesBytes } from "./globalVariables";
export { ComputedOperators } from "../batchMultiSigCall/classes/Variables/computedConstants";
// Global Variables
export const getBlockNumber = () => ({ type: "global", id: "blockNumber" });
export const getBlockTimestamp = () => ({ type: "global", id: "blockTimestamp" });
export const getGasPrice = () => ({ type: "global", id: "gasPrice" });
export const getMinerAddress = () => ({ type: "global", id: "minerAddress" });
export const getOriginAddress = () => ({ type: "global", id: "originAddress" });
export const getInvestorAddress = () => ({ type: "global", id: "investorAddress" });
export const getActivatorAddress = () => ({ type: "global", id: "activatorAddress" });
export const getEngineAddress = () => ({ type: "global", id: "engineAddress" });
export const getChainID = () => ({ type: "global", id: "chainId" });
export const getFlowHash = () => ({ type: "global", id: "flowHash" });
export const getRandomNumber = () => ({ type: "global", id: "randomNumber" });
export const getL1BlockNumber = () => ({ type: "global", id: "l1BlockNumber" });
export const getFctMaxGasPrice = () => ({ type: "global", id: "fctMaxGasPrice" });
/**
 * Generates the output variable based on the provided call index and inner index.
 * @param {number} index - The index of the call.
 * @param {number} innerIndex - The index of the slot of the result.
 * @param {string} type - The type of the output variable. Defaults to "uint256".
 * @returns {string} - The output variable.
 */
export function getOutputVariable({ index, innerIndex, type = "uint256", }) {
    const outputIndexHex = (index + 1).toString(16).padStart(4, "0");
    let base;
    let innerIndexHex;
    innerIndex = innerIndex ?? 0;
    if (innerIndex < 0) {
        innerIndexHex = ((innerIndex + 1) * -1).toString(16).padStart(4, "0");
        base = type === "address" ? BackOutputVariableBaseAddress : BackOutputVariableBaseBytes32;
    }
    else {
        innerIndexHex = innerIndex.toString(16).padStart(4, "0");
        base = type === "address" ? OutputVariableBaseAddress : OutputVariableBaseBytes32;
    }
    return (innerIndexHex + outputIndexHex).padStart(base.length, base);
}
/**
 * Retrieves the external variable based on the provided index and type.
 * @param {number} index - The index of the external variable.
 * @param {string} type - The type of the parameter.
 * @returns {string} - The external variable.
 */
export function getExternalVariable({ index, type }) {
    const outputIndexHex = (index + 1).toString(16).padStart(4, "0");
    const base = type === "address" ? ExternalVariableBaseAddress : ExternalVariableBaseBytes32;
    return outputIndexHex.padStart(base.length, base);
}
/**
 * Retrieves the computed variable based on the provided index and type.
 * @param {number} index - The index of the computed variable.
 * @param {string} type - The type of the parameter.
 * @returns {string} - The computed variable.
 */
export function getComputedVariable({ index, type }) {
    const outputIndexHex = (index + 1).toString(16).padStart(4, "0");
    const base = type === "address" ? ComputedBaseAddress : ComputedBaseBytes32;
    return outputIndexHex.padStart(base.length, base);
}
/**
 * Retrieves the value of a global variable based on its ID and type.
 * @param {string} id - The ID of the global variable.
 * @param {string} type - The type of the parameter.
 * @returns {string} The value of the global variable.
 * @throws If the global variable does not exist.
 */
export function getGlobalVariable({ id, type }) {
    if (type.includes("bytes")) {
        if (!(id in globalVariablesBytes)) {
            throw new Error(`Global variable ${id} does not support bytes`);
        }
        return globalVariablesBytes[id];
    }
    const globalVariable = globalVariables[id];
    if (!globalVariable) {
        throw new Error("Global variable not found");
    }
    return globalVariable;
}
//# sourceMappingURL=variables.js.map