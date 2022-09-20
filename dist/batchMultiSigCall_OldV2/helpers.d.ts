import { TypedData } from "ethers-eip712";
import { BatchMSCallInput, MSCallInput } from "./interfaces";
export declare const handleMethodInterface: (call: MSCallInput) => string;
export declare const handleFunctionSignature: (call: MSCallInput) => string;
export declare const handleEnsHash: (call: MSCallInput) => string;
export declare const handleData: (call: MSCallInput) => string;
export declare const handleTypes: (call: MSCallInput) => number[];
export declare const handleTypedHashes: (call: MSCallInput, typedData: TypedData) => string[];
export declare const getSessionId: (salt: string, batchCall: BatchMSCallInput) => string;
