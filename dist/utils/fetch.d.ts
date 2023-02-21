import { ethers } from "ethers";
import { IRequiredApproval } from "types";
export declare const fetchCurrentApprovals: ({ rpcUrl, provider, data, }: {
    rpcUrl?: string | undefined;
    provider?: ethers.providers.JsonRpcProvider | ethers.providers.Web3Provider | undefined;
    data: IRequiredApproval[];
}) => Promise<(IRequiredApproval & {
    value: string | boolean;
})[]>;
