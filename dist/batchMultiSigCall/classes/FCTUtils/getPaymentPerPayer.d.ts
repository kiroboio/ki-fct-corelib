import { MSCall } from "../../types";
export declare function getPayersForRoute({ calls, pathIndexes, calldata, }: {
    calls: MSCall[];
    pathIndexes: string[];
    calldata: string;
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
