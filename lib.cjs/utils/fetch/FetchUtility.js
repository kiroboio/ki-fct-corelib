"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FetchUtility = void 0;
const ethers_1 = require("ethers");
const constants_1 = require("../../constants");
const Interfaces_1 = require("../../helpers/Interfaces");
const fetch_1 = require("../fetch");
class FetchUtility {
    chainId;
    multicallContract;
    constructor({ rpcUrl, chainId, provider }) {
        if (!provider) {
            if (!rpcUrl) {
                throw new Error("No provider or rpcUrl provided");
            }
            provider = new ethers_1.ethers.providers.JsonRpcProvider(rpcUrl);
        }
        if (typeof chainId === "string") {
            chainId = Number(chainId);
        }
        this.chainId = chainId;
        if (!constants_1.multicallContracts[Number(chainId)]) {
            throw new Error("Multicall contract not found for this chain");
        }
        this.multicallContract = new ethers_1.ethers.Contract(constants_1.multicallContracts[Number(chainId)], Interfaces_1.Interfaces.Multicall, provider);
    }
    async fetchCurrentApprovals(data) {
        const multicallContract = this.multicallContract;
        return await (0, fetch_1.fetchCurrentApprovals)({
            data,
            multicallContract,
            chainId: this.chainId,
            provider: multicallContract.provider,
        });
    }
    async getTokensTotalSupply(requiredApprovals) {
        // Filter all tokens that are not ERC20 and duplicate tokens
        const erc20Tokens = requiredApprovals.filter((approval) => approval.protocol === "ERC20");
        const ERC20Interface = new ethers_1.ethers.utils.Interface(["function totalSupply() view returns (uint256)"]);
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
exports.FetchUtility = FetchUtility;
//# sourceMappingURL=FetchUtility.js.map