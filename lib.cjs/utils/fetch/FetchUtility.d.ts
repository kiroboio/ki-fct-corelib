import { ethers } from "ethers";
import { IRequiredApproval } from "../../types";
interface FetchUtilConstructor {
    rpcUrl?: string;
    provider?: ethers.providers.JsonRpcProvider | ethers.providers.Web3Provider;
    chainId: number | string;
}
export declare class FetchUtility {
    chainId: number;
    private readonly multicallContract;
    constructor({ rpcUrl, chainId, provider }: FetchUtilConstructor);
    fetchCurrentApprovals(data: IRequiredApproval[]): Promise<(IRequiredApproval & {
        value: string | boolean;
    })[]>;
    getTokensTotalSupply(requiredApprovals: IRequiredApproval[]): Promise<Record<string, string>>;
}
export {};
//# sourceMappingURL=FetchUtility.d.ts.map