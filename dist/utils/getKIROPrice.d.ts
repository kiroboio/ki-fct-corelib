import { ethers } from "ethers";
export declare const getKIROPrice: ({ chainId, rpcUrl, provider, blockTimestamp, }: {
    chainId: number;
    rpcUrl?: string | undefined;
    provider?: ethers.providers.JsonRpcProvider | ethers.providers.Web3Provider | undefined;
    blockTimestamp?: number | undefined;
}) => Promise<string>;
