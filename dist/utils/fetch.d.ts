import { ethers } from "ethers";
export declare const fetchCurrentApprovals: ({ rpcUrl, provider, data, }: {
    rpcUrl?: string;
    provider?: ethers.providers.JsonRpcProvider | ethers.providers.Web3Provider;
    data: {
        token: string;
        from: string;
        spender: string;
    }[];
}) => Promise<{
    token: string;
    spender: string;
    value: string;
    from: string;
}[]>;
