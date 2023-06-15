import { BatchMultiSigCall } from "../batchMultiSigCall";

export abstract class FCTBase {
  protected FCT: BatchMultiSigCall;
  protected constructor(FCT: BatchMultiSigCall) {
    this.FCT = FCT;
  }
}
