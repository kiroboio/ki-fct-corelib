import { CallOptions, DeepRequired } from "../../../types";
import {
  BatchMultiSigCallTypedData,
  DecodedCalls,
  MSCall,
  StrictMSCallInput,
  TypedDataMessageTransaction,
} from "../../types";

export interface ICall {
  get options(): DeepRequired<CallOptions>;
  get nodeId(): string;
  get(): StrictMSCallInput;
  getDecoded(): DecodedCalls;
  getAsMCall(typedData: BatchMultiSigCallTypedData, index: number): MSCall;
  generateEIP712Type(index: number): {
    structTypes: { [key: string]: { name: string; type: string }[] };
    callType: { name: string; type: string }[];
  };
  generateEIP712Message(index: number): TypedDataMessageTransaction;
  getTypedHashes(index: number): string[];
  getEncodedData(): string;
  getTypesArray(): number[];
  getFunctionSignature(): string;
  getFunction(): string;
}

export type GetValueType = boolean | string | GetValueType[] | GetValueType[][];
