import { SessionIdBase } from "../SessionIdBase";
export declare class SessionId_oldVersion extends SessionIdBase {
    asString(): string;
    parse(sessionId: string): {
        validFrom: string;
        expiresAt: string;
        maxGasPrice: string;
        dryRun: boolean;
        blockable: boolean;
        purgeable: boolean;
        authEnabled: boolean;
        recurrency: {
            accumetable: boolean;
            chillTime: string;
            maxRepeats: string;
        };
        multisig: {
            minimumApprovals: string;
        };
    };
}
//# sourceMappingURL=SessionId.d.ts.map