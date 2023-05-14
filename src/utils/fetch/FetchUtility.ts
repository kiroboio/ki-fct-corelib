import { BigNumber, ethers } from "ethers";

import { multicallContracts } from "../../constants";
import { Interface } from "../../helpers/Interfaces";
import { IRequiredApproval } from "../../types";
import { fetchCurrentApprovals } from "../fetch/helpers";

interface FetchUtilConstructor {
  rpcUrl?: string;
  provider?: ethers.providers.JsonRpcProvider | ethers.providers.Web3Provider;
  chainId: number | string;
}

export class FetchUtility {
  public chainId: number;
  private readonly multicallContract: ethers.Contract;

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

    this.multicallContract = new ethers.Contract(
      multicallContracts[Number(chainId) as keyof typeof multicallContracts],
      Interface.Multicall,
      provider
    );
  }

  public async fetchCurrentApprovals(data: IRequiredApproval[]) {
    const multicallContract = this.multicallContract;

    return await fetchCurrentApprovals({
      data,
      multicallContract,
      chainId: this.chainId,
      provider: multicallContract.provider,
    });
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

    const [, returnData]: [string, string[]] = await this.multicallContract.callStatic.aggregate(calls);

    return returnData.reduce((acc, res, index) => {
      const decoded = ERC20Interface.decodeFunctionResult("totalSupply", res);

      acc[calls[index].target] = (decoded[0] as BigNumber).toString();

      return acc;
    }, {} as Record<string, string>);
  }
}
