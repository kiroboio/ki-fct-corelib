import { BigNumber, ethers } from "ethers";
import { IRequiredApproval } from "types";

import { multicallContracts } from "../constants";

const fetchApprovalsInterface = new ethers.utils.Interface([
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

    const decoded = fetchApprovalsInterface.decodeFunctionResult(functionName, res);

    return {
      ...data[index],
      value: functionName === "allowance" ? (decoded[0] as BigNumber).toString() : decoded[0],
    };
  });

  return approvals;
};

interface FetchUtilConstructor {
  rpcUrl?: string;
  provider?: ethers.providers.JsonRpcProvider | ethers.providers.Web3Provider;
  chainId: number | string;
}
export class FetchUtility {
  public chainId: number;
  private mutlicallContract: ethers.Contract;

  constructor({ rpcUrl, chainId, provider }: FetchUtilConstructor) {
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

    if (!multicallContracts[Number(chainId) as keyof typeof multicallContracts]) {
      throw new Error("Multicall contract not found for this chain");
    }

    this.mutlicallContract = new ethers.Contract(
      multicallContracts[Number(chainId) as keyof typeof multicallContracts],
      [
        "function aggregate((address target, bytes callData)[] calls) external view returns (uint256 blockNumber, bytes[] returnData)",
      ],
      provider
    );
  }

  public async fetchCurrentApprovals(data: IRequiredApproval[]) {
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

    const [, returnData]: [string, string[]] = await multiCallContract.callStatic.aggregate(
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
  }

  public async getTokensTotalSupply(requiredApprovals: IRequiredApproval[]): Promise<Record<string, string>> {
    // Filter all tokens that are not ERC20 and duplicate tokens
    const erc20Tokens = requiredApprovals.filter((approval) => approval.protocol === "ERC20");

    const ERC20Interface = new ethers.utils.Interface(["function totalSupply() view returns (uint256)"]);

    const calls = erc20Tokens.map(({ token: target }) => {
      return {
        target,
        callData: ERC20Interface.encodeFunctionData("totalSupply"),
      };
    });

    const [, returnData]: [string, string[]] = await this.mutlicallContract.callStatic.aggregate(calls);

    return returnData.reduce((acc, res, index) => {
      const decoded = ERC20Interface.decodeFunctionResult("totalSupply", res);

      acc[calls[index].target] = (decoded[0] as BigNumber).toString();

      return acc;
    }, {} as Record<string, string>);
  }
}
