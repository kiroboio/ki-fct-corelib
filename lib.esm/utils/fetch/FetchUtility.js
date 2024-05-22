import { ethers } from "ethers";
import { multicallContracts } from "../../constants";
import { Interfaces } from "../../helpers/Interfaces";
import { fetchCurrentApprovals } from "../fetch";
export class FetchUtility {
    chainId;
    multicallContract;
    constructor({ rpcUrl, chainId, provider, multicallAddress }) {
        if (!provider) {
            if (!rpcUrl) {
                throw new Error("No provider or rpcUrl provided");
            }
            provider = new ethers.providers.JsonRpcProvider(rpcUrl);
        }
        if (typeof chainId === "string") {
            chainId = Number(chainId);
        }
        this.chainId = chainId;
        const mcallAddress = multicallAddress || multicallContracts[chainId];
        if (!mcallAddress) {
            throw new Error("Multicall contract not found for this chain");
        }
        this.multicallContract = new ethers.Contract(mcallAddress, Interfaces.Multicall, provider);
    }
    async fetchCurrentApprovals(data) {
        const multicallContract = this.multicallContract;
        return await fetchCurrentApprovals({
            data,
            multicallContract,
            chainId: this.chainId,
            provider: multicallContract.provider,
        });
    }
    async getTokensTotalSupply(requiredApprovals) {
        // Filter all tokens that are not ERC20 and duplicate tokens
        const erc20Tokens = requiredApprovals.filter((approval) => approval.protocol === "ERC20");
        const ERC20Interface = new ethers.utils.Interface(["function totalSupply() view returns (uint256)"]);
        const calls = erc20Tokens.map(({ token: target }) => {
            return {
                target,
                callData: ERC20Interface.encodeFunctionData("totalSupply"),
            };
        });
        const [, returnData] = await this.multicallContract.callStatic.aggregate(calls);
        return returnData.reduce((acc, res, index) => {
            const decoded = ERC20Interface.decodeFunctionResult("totalSupply", res);
            acc[calls[index].target] = decoded[0].toString();
            return acc;
        }, {});
    }
}
//# sourceMappingURL=FetchUtility.js.map