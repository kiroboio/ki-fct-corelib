import { BigNumber, ethers } from "ethers";

import { IRequiredApproval } from "../../batchMultiSigCall/types";
import { multicallContracts } from "../../constants";
import { Interfaces } from "../../helpers/Interfaces";

export const fetchApprovalsInterface = new ethers.utils.Interface([
  "function allowance(address owner, address spender) view returns (uint256)",
  "function getApproved(uint256 tokenId) view returns (address)",
  "function isApprovedForAll(address owner, address operator) view returns (bool)",
]);

const generateDataForCall = (data: IRequiredApproval) => {
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

export const fetchCurrentApprovals = async ({
  data,
  multicallContractAddress,
  multicallContract,
  rpcUrl,
  provider,
  chainId,
}: {
  provider?: ethers.providers.Provider;
  rpcUrl?: string;
  data: IRequiredApproval[];
  multicallContractAddress?: string;
  multicallContract?: ethers.Contract;
  chainId?: number | string;
}): Promise<(IRequiredApproval & { value: string | boolean })[]> => {
  if (!provider) {
    if (!rpcUrl) {
      throw new Error("No provider or rpcUrl provided");
    }

    provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  }

  chainId = chainId ?? (await provider.getNetwork()).chainId.toString();

  if (!multicallContract) {
    multicallContractAddress =
      multicallContractAddress ?? multicallContracts[Number(chainId) as keyof typeof multicallContracts];

    if (!multicallContractAddress) {
      throw new Error("Multicall contract not found for this chain");
    }

    multicallContract = new ethers.Contract(multicallContractAddress, Interfaces.MultiCall, provider);
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

  const [, returnData]: [string, string[]] = await multicallContract.callStatic.aggregate(
    calls.map((call) => call.dataForMulticall)
  );

  const approvals = returnData.map((res, index) => {
    const functionName = calls[index].functionName;
    const decoded = fetchApprovalsInterface.decodeFunctionResult(functionName, res);

    return {
      ...data[index],
      value: functionName === "allowance" ? (decoded[0] as BigNumber).toString() : decoded[0],
    };
  });

  return approvals;
};
