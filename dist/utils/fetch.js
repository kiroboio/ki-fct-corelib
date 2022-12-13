"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchCurrentApprovals = void 0;
const constants_1 = require("../constants");
const ethers_1 = require("ethers");
const fetchCurrentApprovals = async ({ rpcUrl, provider, data, }) => {
    if (!provider) {
        if (!rpcUrl) {
            throw new Error("No provider or rpcUrl provided");
        }
        provider = new ethers_1.ethers.providers.JsonRpcProvider(rpcUrl);
    }
    const chainId = (await provider.getNetwork()).chainId.toString();
    if (!constants_1.multicallContracts[chainId]) {
        throw new Error("Multicall contract not found for this chain");
    }
    const multiCallContract = new ethers_1.ethers.Contract(constants_1.multicallContracts[chainId], [
        "function aggregate((address target, bytes callData)[] calls) external view returns (uint256 blockNumber, bytes[] returnData)",
    ], provider);
    const calls = data.map((approval) => {
        return {
            target: approval.token,
            callData: new ethers_1.ethers.utils.Interface([
                "function allowance(address owner, address spender) view returns (uint256)",
            ]).encodeFunctionData("allowance", [approval.from, approval.spender]),
        };
    });
    const [, returnData] = await multiCallContract.callStatic.aggregate(calls);
    const approvals = returnData.map((appr, index) => {
        const decoded = ethers_1.utils.defaultAbiCoder.decode(["uint256"], appr);
        return {
            ...data[index],
            value: decoded[0].toString(),
        };
    });
    return approvals;
};
exports.fetchCurrentApprovals = fetchCurrentApprovals;
