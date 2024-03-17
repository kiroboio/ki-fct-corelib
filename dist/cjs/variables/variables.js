"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGlobalVariable = exports.getComputedVariable = exports.getExternalVariable = exports.getOutputVariable = exports.getFlowHash = exports.getChainID = exports.getEngineAddress = exports.getActivatorAddress = exports.getInvestorAddress = exports.getOriginAddress = exports.getMinerAddress = exports.getGasPrice = exports.getBlockTimestamp = exports.getBlockNumber = void 0;
const constants_1 = require("../constants");
const globalVariables_1 = require("./globalVariables");
// Global Variables
const getBlockNumber = () => ({ type: "global", id: "blockNumber" });
exports.getBlockNumber = getBlockNumber;
const getBlockTimestamp = () => ({ type: "global", id: "blockTimestamp" });
exports.getBlockTimestamp = getBlockTimestamp;
const getGasPrice = () => ({ type: "global", id: "gasPrice" });
exports.getGasPrice = getGasPrice;
const getMinerAddress = () => ({ type: "global", id: "minerAddress" });
exports.getMinerAddress = getMinerAddress;
const getOriginAddress = () => ({ type: "global", id: "originAddress" });
exports.getOriginAddress = getOriginAddress;
const getInvestorAddress = () => ({ type: "global", id: "investorAddress" });
exports.getInvestorAddress = getInvestorAddress;
const getActivatorAddress = () => ({ type: "global", id: "activatorAddress" });
exports.getActivatorAddress = getActivatorAddress;
const getEngineAddress = () => ({ type: "global", id: "engineAddress" });
exports.getEngineAddress = getEngineAddress;
const getChainID = () => ({ type: "global", id: "chainId" });
exports.getChainID = getChainID;
const getFlowHash = () => ({ type: "global", id: "flowHash" });
exports.getFlowHash = getFlowHash;
/**
 * Generates the output variable based on the provided call index and inner index.
 * @param {number} index - The index of the call.
 * @param {number} innerIndex - The index of the slot of the result.
 * @param {string} type - The type of the output variable. Defaults to "uint256".
 * @returns {string} - The output variable.
 */
function getOutputVariable({ index, innerIndex, type = "uint256", }) {
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
/**
 * Retrieves the external variable based on the provided index and type.
 * @param {number} index - The index of the external variable.
 * @param {string} type - The type of the parameter.
 * @returns {string} - The external variable.
 */
function getExternalVariable({ index, type }) {
    const outputIndexHex = (index + 1).toString(16).padStart(4, "0");
    if (type.includes("bytes")) {
        return outputIndexHex.padStart(constants_1.FCBaseBytes.length, constants_1.FCBaseBytes);
    }
    return outputIndexHex.padStart(constants_1.FCBase.length, constants_1.FCBase);
}
exports.getExternalVariable = getExternalVariable;
/**
 * Retrieves the computed variable based on the provided index and type.
 * @param {number} index - The index of the computed variable.
 * @param {string} type - The type of the parameter.
 * @returns {string} - The computed variable.
 */
function getComputedVariable({ index, type }) {
    const outputIndexHex = (index + 1).toString(16).padStart(4, "0");
    if (type.includes("bytes")) {
        return outputIndexHex.padStart(constants_1.ComputedBaseBytes.length, constants_1.ComputedBaseBytes);
    }
    return outputIndexHex.padStart(constants_1.ComputedBase.length, constants_1.ComputedBase);
}
exports.getComputedVariable = getComputedVariable;
/**
 * Retrieves the value of a global variable based on its ID and type.
 * @param {string} id - The ID of the global variable.
 * @param {string} type - The type of the parameter.
 * @returns {string} The value of the global variable.
 * @throws If the global variable does not exist.
 */
function getGlobalVariable({ id, type }) {
    if (type.includes("bytes")) {
        if (!(id in globalVariables_1.globalVariablesBytes)) {
            throw new Error(`Global variable ${id} does not support bytes`);
        }
        return globalVariables_1.globalVariablesBytes[id];
    }
    const globalVariable = globalVariables_1.globalVariables[id];
    if (!globalVariable) {
        throw new Error("Global variable not found");
    }
    return globalVariable;
}
exports.getGlobalVariable = getGlobalVariable;
//# sourceMappingURL=variables.js.map