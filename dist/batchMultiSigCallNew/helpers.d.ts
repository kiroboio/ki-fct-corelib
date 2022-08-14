import { BatchMultiSigCallNew } from ".";
import { MultiSigCallInputInterface } from "./interfaces";
export declare const handleTo: (self: BatchMultiSigCallNew, call: MultiSigCallInputInterface) => string;
export declare const handleMethodInterface: (call: MultiSigCallInputInterface) => string;
export declare const handleFunctionSignature: (call: MultiSigCallInputInterface) => string;
export declare const handleEnsHash: (call: MultiSigCallInputInterface) => string;
export declare const handleData: (call: MultiSigCallInputInterface) => string;
export declare const handleTypes: (call: MultiSigCallInputInterface) => any;
export declare const handleTypedHashes: (call: MultiSigCallInputInterface, typedData: any) => any[];
