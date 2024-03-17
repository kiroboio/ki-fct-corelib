import { Variable } from "../types";
import { globalVariables } from "./globalVariables";
export declare const getBlockNumber: () => Variable;
export declare const getBlockTimestamp: () => Variable;
export declare const getGasPrice: () => Variable;
export declare const getMinerAddress: () => Variable;
export declare const getOriginAddress: () => Variable;
export declare const getInvestorAddress: () => Variable;
export declare const getActivatorAddress: () => Variable;
export declare const getEngineAddress: () => Variable;
export declare const getChainID: () => Variable;
export declare const getFlowHash: () => Variable;
/**
 * Generates the output variable based on the provided call index and inner index.
 * @param {number} index - The index of the call.
 * @param {number} innerIndex - The index of the slot of the result.
 * @param {string} type - The type of the output variable. Defaults to "uint256".
 * @returns {string} - The output variable.
 */
export declare function getOutputVariable({ index, innerIndex, type, }: {
    index: number;
    innerIndex: number;
    type?: string;
}): string;
/**
 * Retrieves the external variable based on the provided index and type.
 * @param {number} index - The index of the external variable.
 * @param {string} type - The type of the parameter.
 * @returns {string} - The external variable.
 */
export declare function getExternalVariable({ index, type }: {
    index: number;
    type: string;
}): string;
/**
 * Retrieves the computed variable based on the provided index and type.
 * @param {number} index - The index of the computed variable.
 * @param {string} type - The type of the parameter.
 * @returns {string} - The computed variable.
 */
export declare function getComputedVariable({ index, type }: {
    index: number;
    type: string;
}): string;
/**
 * Retrieves the value of a global variable based on its ID and type.
 * @param {string} id - The ID of the global variable.
 * @param {string} type - The type of the parameter.
 * @returns {string} The value of the global variable.
 * @throws If the global variable does not exist.
 */
export declare function getGlobalVariable({ id, type }: {
    id: keyof typeof globalVariables;
    type: string;
}): string;
//# sourceMappingURL=variables.d.ts.map