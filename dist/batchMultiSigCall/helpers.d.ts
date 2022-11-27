import { TypedData } from "ethers-eip712";
import { MSCallOptions } from "./interfaces";
import { IMSCallInput } from "./interfaces";
import { Flow } from "../constants";
import { Variable } from "interfaces";
import { MessageTypeProperty, TypedMessage } from "@metamask/eth-sig-util";
export declare const instanceOfVariable: (object: any) => object is Variable;
export declare const handleMethodInterface: (call: IMSCallInput) => string;
export declare const handleFunctionSignature: (call: IMSCallInput) => string;
export declare const handleEnsHash: (call: IMSCallInput) => string;
export declare const handleData: (call: IMSCallInput) => string;
export declare const handleTypes: (call: IMSCallInput) => number[];
export declare const handleTypedHashes: (call: IMSCallInput, typedData: TypedMessage<Record<"EIP712Domain" & string, MessageTypeProperty[]>>) => string[];
export declare const manageFlow: (call: IMSCallInput) => string;
export declare const manageCallId: (calls: IMSCallInput[], call: IMSCallInput, index: number) => string;
export declare const getSessionId: (salt: string, options: MSCallOptions) => string;
export declare const parseSessionID: (sessionId: string, builder: string) => MSCallOptions;
export declare const parseCallID: (callId: string) => {
    options: {
        gasLimit: number;
        flow: Flow;
        jumpOnSuccess: number;
        jumpOnFail: number;
    };
    viewOnly: boolean;
    permissions: string;
    payerIndex: number;
    callIndex: number;
};
export declare const getTxEIP712Types: (calls: IMSCallInput[]) => {
    txTypes: {};
    structTypes: {};
};
export declare const getUsedStructTypes: (typedData: TypedData, typeName: string) => string[];
