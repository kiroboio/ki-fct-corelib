import { ethers } from "ethers";
import { IRequiredApproval } from "../../batchMultiSigCall/types";
export declare const fetchCurrentApprovals: ({ rpcUrl, provider, chainId, multicallContract, multicallContractAddress, data, }: {
    rpcUrl?: string;
    provider?: ethers.providers.Provider;
    chainId?: number | string;
    multicallContract?: ethers.Contract;
    multicallContractAddress?: string;
    data: IRequiredApproval[];
}) => Promise<(IRequiredApproval & {
    value: string | boolean;
})[]>;
//# sourceMappingURL=helpers.d.ts.map