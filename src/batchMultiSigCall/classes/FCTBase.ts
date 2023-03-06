import { BatchMultiSigCall } from "../batchMultiSigCall";

export class FCTBase {
  protected FCT: BatchMultiSigCall;
  constructor(FCT: BatchMultiSigCall) {
    this.FCT = FCT;
  }
}
