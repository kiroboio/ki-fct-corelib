import { ethers } from "ethers";
import { IRequiredApproval } from "../../batchMultiSigCall/types";
export declare const fetchCurrentApprovals: ({ rpcUrl, provider, chainId, multicallContract, multicallContractAddress, data, }: {
    rpcUrl?: string | undefined;
    provider?: ethers.providers.Provider | undefined;
    chainId?: string | number | undefined;
    multicallContract?: ethers.Contract | undefined;
    multicallContractAddress?: string | undefined;
    data: IRequiredApproval[];
}) => Promise<(IRequiredApproval & {
    value: string | boolean;
})[]>;
//# sourceMappingURL=helpers.d.ts.map