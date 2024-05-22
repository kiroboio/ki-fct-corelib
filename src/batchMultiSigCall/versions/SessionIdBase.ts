import { BatchMultiSigCall } from "..";

export abstract class SessionIdBase {
  public FCT?: BatchMultiSigCall;
  constructor(FCT?: BatchMultiSigCall) {
    this.FCT = FCT;
  }
  //   abstract asString({ salt, version, options }: { salt: string; version: string; options: RequiredFCTOptions }): string;
  abstract asString(): string;
  abstract parse(sessionId: string): Record<string, any>;
}
