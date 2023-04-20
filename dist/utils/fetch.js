"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FetchUtility = exports.fetchCurrentApprovals = void 0;
const ethers_1 = require("ethers");
const constants_1 = require("../constants");
const fetchApprovalsInterface = new ethers_1.ethers.utils.Interface([
    "function allowance(address owner, address spender) view returns (uint256)",
    "function getApproved(uint256 tokenId) view returns (address)",
    "function isApprovedForAll(address owner, address operator) view returns (bool)",
]);
const generateDataForCall = (data) => {
    if (data.protocol === "ERC20") {
        if (data.method === "approve") {
            return {
                functionName: "allowance",
                encodedData: fetchApprovalsInterface.encodeFunctionData("allowance", [data.from, data.params.spender]),
            };
        }
    }
    if (data.protocol === "ERC721") {
        if (data.method === "approve") {
            return {
                functionName: "getApproved",
                encodedData: fetchApprovalsInterface.encodeFunctionData("getApproved", [data.params.tokenId]),
            };
        }
    }
    if (data.method === "setApprovalForAll") {
        return {
            functionName: "isApprovedForAll",
            encodedData: fetchApprovalsInterface.encodeFunctionData("isApprovedForAll", [data.from, data.params.spender]),
        };
    }
};
const fetchCurrentApprovals = async ({ rpcUrl, provider, data, }) => {
    if (!provider) {
        if (!rpcUrl) {
            throw new Error("No provider or rpcUrl provided");
        }
        provider = new ethers_1.ethers.providers.JsonRpcProvider(rpcUrl);
    }
    const chainId = (await provider.getNetwork()).chainId.toString();
    if (!constants_1.multicallContracts[Number(chainId)]) {
        throw new Error("Multicall contract not found for this chain");
    }
    const multiCallContract = new ethers_1.ethers.Contract(constants_1.multicallContracts[Number(chainId)], [
        "function aggregate((address target, bytes callData)[] calls) external view returns (uint256 blockNumber, bytes[] returnData)",
    ], provider);
    const calls = data.map((approval) => {
        const dataOfCall = generateDataForCall(approval);
        if (!dataOfCall) {
            throw new Error("Approval not found");
        }
        const { functionName, encodedData } = dataOfCall;
        return {
            functionName,
            dataForMulticall: {
                target: approval.token,
                callData: encodedData,
            },
        };
    });
    const [, returnData] = await multiCallContract.callStatic.aggregate(calls.map((call) => call.dataForMulticall));
    const approvals = returnData.map((res, index) => {
        const functionName = calls[index].functionName;
        const decoded = fetchApprovalsInterface.decodeFunctionResult(functionName, res);
        return {
            ...data[index],
            value: functionName === "allowance" ? decoded[0].toString() : decoded[0],
        };
    });
    return approvals;
};
exports.fetchCurrentApprovals = fetchCurrentApprovals;
class FetchUtility {
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
        this.mutlicallContract = new ethers_1.ethers.Contract(constants_1.multicallContracts[Number(chainId)], [
            "function aggregate((address target, bytes callData)[] calls) external view returns (uint256 blockNumber, bytes[] returnData)",
        ], provider);
    }
    async fetchCurrentApprovals(data) {
        const multiCallContract = this.mutlicallContract;
        const calls = data.map((approval) => {
            const dataOfCall = generateDataForCall(approval);
            if (!dataOfCall) {
                throw new Error("Approval not found");
            }
            const { functionName, encodedData } = dataOfCall;
            return {
                functionName,
                dataForMulticall: {
                    target: approval.token,
                    callData: encodedData,
                },
            };
        });
        const [, returnData] = await multiCallContract.callStatic.aggregate(calls.map((call) => call.dataForMulticall));
        const approvals = returnData.map((res, index) => {
            const functionName = calls[index].functionName;
            const decoded = fetchApprovalsInterface.decodeFunctionResult(functionName, res);
            return {
                ...data[index],
                value: functionName === "allowance" ? decoded[0].toString() : decoded[0],
            };
        });
        return approvals;
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
        const [, returnData] = await this.mutlicallContract.callStatic.aggregate(calls);
        return returnData.reduce((acc, res, index) => {
            const decoded = ERC20Interface.decodeFunctionResult("totalSupply", res);
            acc[calls[index].target] = decoded[0].toString();
            return acc;
        }, {});
    }
}
exports.FetchUtility = FetchUtility;
