import { BatchMultiSigCallTypedData } from "batchMultiSigCall/types";
import { Param } from "../types";
export declare const getTypesArray: (params: Param[]) => number[];
export declare const getTypedHashes: (params: Param[], typedData: BatchMultiSigCallTypedData) => string[];
