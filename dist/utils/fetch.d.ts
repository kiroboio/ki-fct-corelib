import { ethers } from "ethers";
import { IRequiredApproval } from "../types";
export declare const fetchCurrentApprovals: ({ rpcUrl, provider, data, }: {
    rpcUrl?: string | undefined;
    provider?: ethers.providers.JsonRpcProvider | ethers.providers.Web3Provider | undefined;
    data: IRequiredApproval[];
}) => Promise<(IRequiredApproval & {
    value: string | boolean;
})[]>;
interface FetchUtilConstructor {
    rpcUrl?: string;
    provider?: ethers.providers.JsonRpcProvider | ethers.providers.Web3Provider;
    chainId: number | string;
}
export declare class FetchUtility {
    chainId: number;
    private mutlicallContract;
    constructor({ rpcUrl, chainId, provider }: FetchUtilConstructor);
    fetchCurrentApprovals(data: IRequiredApproval[]): Promise<({
        value: any;
        protocol: "ERC20";
        method: "approve";
        params: {
            spender: string;
            amount: string;
        };
        token: string;
        from: string;
    } | {
        value: any;
        protocol: "ERC721";
        method: "approve";
        params: {
            spender: string;
            tokenId: string;
        };
        token: string;
        from: string;
    } | {
        value: any;
        protocol: "ERC721" | "ERC1155";
        method: "setApprovalForAll";
        params: {
            spender: string;
            approved: boolean;
            ids: string[];
        };
        token: string;
        from: string;
    } | {
        value: any;
        protocol: "AAVE";
        method: "approveDelegation";
        params: {
            delegatee: string;
            amount: string;
        };
        token: string;
        from: string;
    })[]>;
    getTokensTotalSupply(requiredApprovals: IRequiredApproval[]): Promise<Record<string, string>>;
}
export {};
