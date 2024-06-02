import { BatchMultiSigCall } from "..";
export declare abstract class SessionIdBase {
    FCT?: BatchMultiSigCall;
    constructor(FCT?: BatchMultiSigCall);
    abstract asString(): string;
    abstract parse(sessionId: string): Record<string, any>;
}
//# sourceMappingURL=SessionIdBase.d.ts.map