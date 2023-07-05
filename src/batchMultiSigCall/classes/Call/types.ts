import { CallOptions, DeepRequired } from "../../../types";
import {
  BatchMultiSigCallTypedData,
  DecodedCalls,
  MSCall,
  StrictMSCallInput,
  TypedDataMessageTransaction,
} from "../../types";

export interface ICall {
  get get(): StrictMSCallInput;
  get options(): DeepRequired<CallOptions>;
  get getDecoded(): DecodedCalls;
  get nodeId(): string;
  getAsMCall(typedData: BatchMultiSigCallTypedData, index: number): MSCall;
  generateEIP712Type(): {
    structTypes: { [key: string]: { name: string; type: string }[] };
    callType: { name: string; type: string }[];
  };
  generateEIP712Message(index: number): TypedDataMessageTransaction;
  getTypedHashes(): string[];
  getEncodedData(): string;
  getTypesArray(): number[];
  getFunctionSignature(): string;
  getFunction(): string;
}

export type GetValueType = boolean | string | GetValueType[] | GetValueType[][];
