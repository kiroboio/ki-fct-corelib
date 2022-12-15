import { MessageTypeProperty, TypedMessage } from "@metamask/eth-sig-util";
import { Param } from "../types";
export declare const getTypesArray: (params: Param[]) => number[];
export declare const getTypedHashes: (params: Param[], typedData: TypedMessage<Record<"EIP712Domain" & string, MessageTypeProperty[]>>) => string[];
