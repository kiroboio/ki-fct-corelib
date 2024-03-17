import { EIP1559GasPrice } from "../types";
export declare const getGasPrices: ({ rpcUrl, chainId, historicalBlocks, tries, }: {
    rpcUrl: string;
    chainId: number;
    historicalBlocks?: number | undefined;
    tries?: number | undefined;
}) => Promise<Record<"slow" | "average" | "fast" | "fastest", EIP1559GasPrice>>;
//# sourceMappingURL=gas.d.ts.map