import { BigNumber, ethers } from "ethers";
import { IRequiredApproval } from "types";

import { multicallContracts } from "../constants";

const iface = new ethers.utils.Interface([
  "function allowance(address owner, address spender) view returns (uint256)",
  "function getApproved(uint256 tokenId) view returns (address)",
  "function isApprovedForAll(address owner, address operator) view returns (bool)",
]);

const generateDataForCall = (data: IRequiredApproval) => {
  if (data.protocol === "ERC20") {
    if (data.method === "approve") {
      return {
        functionName: "allowance",
        encodedData: iface.encodeFunctionData("allowance", [data.from, data.params.spender]),
      };
    }
  }
  if (data.protocol === "ERC721") {
    if (data.method === "approve") {
      return {
        functionName: "getApproved",
        encodedData: iface.encodeFunctionData("getApproved", [data.params.tokenId]),
      };
    }
  }
  if (data.method === "setApprovalForAll") {
    return {
      functionName: "isApprovedForAll",
      encodedData: iface.encodeFunctionData("isApprovedForAll", [data.from, data.params.spender]),
    };
  }
};

export const fetchCurrentApprovals = async ({
  rpcUrl,
  provider,
  data,
}: {
  rpcUrl?: string;
  provider?: ethers.providers.JsonRpcProvider | ethers.providers.Web3Provider;
  data: IRequiredApproval[];
}): Promise<(IRequiredApproval & { value: string | boolean })[]> => {
  if (!provider) {
    if (!rpcUrl) {
      throw new Error("No provider or rpcUrl provided");
    }

    provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  }

  const chainId = (await provider.getNetwork()).chainId.toString();

  if (!multicallContracts[Number(chainId) as keyof typeof multicallContracts]) {
    throw new Error("Multicall contract not found for this chain");
  }

  const multiCallContract = new ethers.Contract(
    multicallContracts[Number(chainId) as keyof typeof multicallContracts],
    [
      "function aggregate((address target, bytes callData)[] calls) external view returns (uint256 blockNumber, bytes[] returnData)",
    ],
    provider
  );

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

  const [, returnData]: [string, string[]] = await multiCallContract.callStatic.aggregate(
    calls.map((call) => call.dataForMulticall)
  );

  const approvals = returnData.map((res, index) => {
    const functionName = calls[index].functionName;

    const decoded = iface.decodeFunctionResult(functionName, res);

    return {
      ...data[index],
      value: functionName === "allowance" ? (decoded[0] as BigNumber).toString() : decoded[0],
    };
  });

  return approvals;
};
