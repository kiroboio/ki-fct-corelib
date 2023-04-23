import { MSCall } from "../../types";
export declare function getPayersForRoute({ calls, pathIndexes, calldata, signatureCount, }: {
    calls: MSCall[];
    pathIndexes: string[];
    calldata: string;
    signatureCount: number;
}): {
    payer: string;
    gas: bigint;
}[];
export declare function getEffectiveGasPrice({ maxGasPrice, gasPrice, baseFeeBPS, bonusFeeBPS, }: {
    maxGasPrice: string | bigint;
    gasPrice: string | bigint;
    baseFeeBPS: bigint;
    bonusFeeBPS: bigint;
}): string;
