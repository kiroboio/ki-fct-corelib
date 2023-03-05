import { BatchMultiSigCall } from "methods";

export class FCTBase {
  protected FCT: BatchMultiSigCall;
  constructor(FCT: BatchMultiSigCall) {
    this.FCT = FCT;
  }
}
