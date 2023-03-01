import { IBatchMultiSigCallFCT, RequiredFCTOptions } from "types";
import { ExportFCT } from "../ExportFCT";
export declare class SessionID {
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
        name: string;
        validFrom: string;
        expiresAt: string;
        maxGasPrice: string;
        blockable: boolean;
        purgeable: boolean;
        authEnabled: boolean;
        builder: string;
        recurrency: {
            accumetable: boolean;
            chillTime: string;
            maxRepeats: string;
        };
        multisig: {
            minimumApprovals: string;
            externalSigners: string[];
        };
    };
    static asStringFromExportFCT(exportFCT: ExportFCT): string;
    static fromFCT(FCT: IBatchMultiSigCallFCT): RequiredFCTOptions;
}
