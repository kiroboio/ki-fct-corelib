import { MessageTypeProperty, TypedMessage } from "@metamask/eth-sig-util";
import { IMSCallInput } from "batchMultiSigCall/types";
export declare const handleMethodInterface: (call: IMSCallInput) => string;
export declare const handleFunctionSignature: (call: IMSCallInput) => string;
export declare const handleEnsHash: (call: IMSCallInput) => string;
export declare const handleData: (call: IMSCallInput) => string;
export declare const handleTypes: (call: IMSCallInput) => number[];
export declare const handleTypedHashes: (call: IMSCallInput, typedData: TypedMessage<Record<"EIP712Domain" & string, MessageTypeProperty[]>>) => string[];
