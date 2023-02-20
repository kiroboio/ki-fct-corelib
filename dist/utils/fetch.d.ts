import { ethers } from "ethers";
export declare const fetchCurrentApprovals: ({ rpcUrl, provider, data, }: {
    rpcUrl?: string | undefined;
    provider?: ethers.providers.JsonRpcProvider | ethers.providers.Web3Provider | undefined;
    data: {
        token: string;
        from: string;
        spender: string;
        requiredAmount?: string;
    }[];
}) => Promise<{
    value: string;
    token: string;
    from: string;
    spender: string;
    requiredAmount?: string | undefined;
}[]>;
