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
    static asOptions({ sessionId, builder, name, externalSigners, }: {
        sessionId: string;
        builder: string;
        name: string;
        externalSigners?: string[];
    }): {
        builder: string;
        name: string;
        multisig: {
            externalSigners: string[];
            minimumApprovals: string;
        };
        validFrom: string;
        expiresAt: string;
        maxGasPrice: string;
        blockable: boolean;
        purgeable: boolean;
        authEnabled: boolean;
        recurrency: {
            accumetable: boolean;
            chillTime: string;
            maxRepeats: string;
        };
    };
    static parse(sessionId: string): {
        validFrom: string;
        expiresAt: string;
        maxGasPrice: string;
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
