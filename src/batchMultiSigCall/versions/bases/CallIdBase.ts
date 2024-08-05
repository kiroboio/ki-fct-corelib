import { BatchMultiSigCall } from "../..";
import { Call, Validation } from "../../classes";
import { StrictMSCallInput } from "../../types";

export abstract class CallIdBase {
  public FCT?: BatchMultiSigCall;
  constructor(FCT?: BatchMultiSigCall) {
    this.FCT = FCT;
  }
  abstract asString({
    calls,
    validation,
    call,
    callFull,
    index,
    payerIndex,
  }: {
    calls: Call[];
    validation: Validation;
    call: Call;
    callFull: StrictMSCallInput;
    index: number;
    payerIndex: number;
  }): string;
  abstract parse(callId: string): Record<string, any>;
  abstract parseWithNumbers(callId: string): Record<string, any>;
}
