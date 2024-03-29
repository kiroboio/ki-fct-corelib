"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchCurrentApprovals = void 0;
const ethers_1 = require("ethers");
const constants_1 = require("../../constants");
const Interfaces_1 = require("../../helpers/Interfaces");
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
const fetchCurrentApprovals = async ({ rpcUrl, provider, chainId, multicallContract, multicallContractAddress, data, }) => {
    if (!provider) {
        if (!rpcUrl) {
            throw new Error("No provider or rpcUrl provided");
        }
        provider = new ethers_1.ethers.providers.JsonRpcProvider(rpcUrl);
    }
    chainId = chainId || (await provider.getNetwork()).chainId.toString();
    if (!multicallContract) {
        multicallContractAddress =
            multicallContractAddress ?? constants_1.multicallContracts[Number(chainId)];
        if (!multicallContractAddress) {
            throw new Error("Multicall contract not found for this chain");
        }
        multicallContract = new ethers_1.ethers.Contract(multicallContractAddress, Interfaces_1.Interfaces.Multicall, provider);
    }
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
    const [, returnData] = await multicallContract.callStatic.aggregate(calls.map((call) => call.dataForMulticall));
    return returnData.map((res, index) => {
        const functionName = calls[index].functionName;
        const decoded = fetchApprovalsInterface.decodeFunctionResult(functionName, res);
        return {
            ...data[index],
            value: functionName === "allowance" ? decoded[0].toString() : decoded[0],
        };
    });
};
exports.fetchCurrentApprovals = fetchCurrentApprovals;
//# sourceMappingURL=helpers.js.map