import { IBatchMultiSigCallFCT } from "../types";
export declare function getCalldataForActuator({ signedFCT, purgedFCT, investor, activator, version, }: {
    signedFCT: IBatchMultiSigCallFCT;
    purgedFCT: string;
    investor: string;
    activator: string;
    version: string;
}): string;
