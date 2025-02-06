import { utils } from "ethers";

import {
  BackOutputVariableBaseAddress,
  BackOutputVariableBaseBytes32,
  ComputedBaseAddress,
  ComputedBaseBytes32,
  ExternalVariableBaseAddress,
  ExternalVariableBaseBytes32,
  OutputVariableBaseAddress,
  OutputVariableBaseBytes32,
} from "../constants";
import { Variable } from "../types";
import { globalVariables, globalVariablesBytes } from "./globalVariables";
export { ComputedOperators } from "../batchMultiSigCall/classes/Variables/computedConstants";

// Global Variables
export const getBlockNumber = (): Variable => ({ type: "global", id: "blockNumber" });
export const getBlockTimestamp = (): Variable => ({ type: "global", id: "blockTimestamp" });
export const getGasPrice = (): Variable => ({ type: "global", id: "gasPrice" });
export const getMinerAddress = (): Variable => ({ type: "global", id: "minerAddress" });
export const getOriginAddress = (): Variable => ({ type: "global", id: "originAddress" });
export const getInvestorAddress = (): Variable => ({ type: "global", id: "investorAddress" });
export const getActivatorAddress = (): Variable => ({ type: "global", id: "activatorAddress" });
export const getEngineAddress = (): Variable => ({ type: "global", id: "engineAddress" });
export const getChainID = (): Variable => ({ type: "global", id: "chainId" });
export const getFlowHash = (): Variable => ({ type: "global", id: "flowHash" });
export const getRandomNumber = (): Variable => ({ type: "global", id: "randomNumber" });
export const getL1BlockNumber = (): Variable => ({ type: "global", id: "l1BlockNumber" });
export const getFctMaxGasPrice = (): Variable => ({ type: "global", id: "fctMaxGasPrice" });

/**
 * Generates the output variable based on the provided call index and inner index.
 * @param {number} index - The index of the call.
 * @param {number} innerIndex - The index of the slot of the result.
 * @param {string} type - The type of the output variable. Defaults to "uint256".
 * @returns {string} - The output variable.
 */
export function getOutputVariable({
  index,
  offset,
  type = "uint256",
}: {
  index: number;
  offset: number;
  type?: string;
}) {
  const outputIndexHex = (index + 1).toString(16).padStart(4, "0");
  let base: string;
  let offsetHex: string;

  if (offset < 0) {
    offset = offset + 32 > 0 ? 0 : offset + 32;
    offsetHex = (offset * -1).toString(16).padStart(5, "0");
    base = type === "address" ? BackOutputVariableBaseAddress : BackOutputVariableBaseBytes32;
  } else {
    offsetHex = (offset + 32).toString(16).padStart(4, "0");
    base = type === "address" ? OutputVariableBaseAddress : OutputVariableBaseBytes32;
  }

  const value = (offsetHex + outputIndexHex).padStart(base.length, base);
  if (type !== "address") return value;

  const address = utils.getAddress(value.toLowerCase());
  return address;
}

/**
 * Retrieves the external variable based on the provided index and type.
 * @param {number} index - The index of the external variable.
 * @param {string} type - The type of the parameter.
 * @returns {string} - The external variable.
 */
export function getExternalVariable({ index, type }: { index: number; type: string }) {
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
export function getComputedVariable({ index, type }: { index: number; type: string }) {
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
export function getGlobalVariable({ id, type }: { id: keyof typeof globalVariables; type: string }): string {
  if (type.includes("bytes")) {
    if (!(id in globalVariablesBytes)) {
      throw new Error(`Global variable ${id} does not support bytes`);
    }
    return globalVariablesBytes[id as keyof typeof globalVariablesBytes];
  }
  const globalVariable = globalVariables[id];
  if (!globalVariable) {
    throw new Error("Global variable not found");
  }

  console.log({ globalvartype: type })
  if (type !== "address") return globalVariable;
  
  const address = utils.getAddress(globalVariable.toLowerCase());
  return address;
}
