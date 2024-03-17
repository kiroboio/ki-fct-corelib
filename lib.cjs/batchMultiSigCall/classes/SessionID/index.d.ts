import { BatchMultiSigCall } from "../../batchMultiSigCall";
import { RequiredFCTOptions } from "../../types";
import { FCTBase } from "../FCTBase";
export declare class SessionID extends FCTBase {
    constructor(FCT: BatchMultiSigCall);
    asString(): string;
    static asString({ salt, version, options }: {
        salt: string;
        version: string;
        options: RequiredFCTOptions;
    }): string;
    static asOptions(sessionId: string): {
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
    static parse(sessionId: string): {
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
//# sourceMappingURL=index.d.ts.map