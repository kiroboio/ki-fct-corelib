import { ethers } from "ethers";
export declare const fetchCurrentApprovals: ({ rpcUrl, provider, data, }: {
    rpcUrl?: string;
    provider?: ethers.providers.JsonRpcProvider | ethers.providers.Web3Provider;
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
    requiredAmount?: string;
}[]>;
