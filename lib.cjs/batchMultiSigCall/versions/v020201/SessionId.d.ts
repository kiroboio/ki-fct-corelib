import { SessionIdBase } from "../SessionIdBase";
export declare class SessionId_020201 extends SessionIdBase {
    asString(): string;
    parse(sessionId: string): {
        validFrom: string;
        expiresAt: string;
        maxGasPrice: string;
        payableGasLimitInKilo: string;
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