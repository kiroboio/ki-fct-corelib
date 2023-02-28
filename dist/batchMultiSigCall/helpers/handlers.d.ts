import { BatchMultiSigCallTypedData, IMSCallInput } from "../types";
export declare const handleMethodInterface: (call: IMSCallInput) => string;
export declare const handleFunctionSignature: (call: IMSCallInput) => string;
export declare const handleEnsHash: (call: IMSCallInput) => string;
export declare const handleData: (call: IMSCallInput) => string;
export declare const handleTypes: (call: IMSCallInput) => number[];
export declare const handleTypedHashes: (call: IMSCallInput, typedData: BatchMultiSigCallTypedData) => string[];