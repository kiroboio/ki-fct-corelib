import { BigNumber, ethers, utils } from "ethers";

import { multicallContracts } from "../constants";

export const fetchCurrentApprovals = async ({
  rpcUrl,
  provider,
  data,
}: {
  rpcUrl?: string;
  provider?: ethers.providers.JsonRpcProvider | ethers.providers.Web3Provider;
  data: { token: string; from: string; spender: string }[];
}) => {
  if (!provider) {
    if (!rpcUrl) {
      throw new Error("No provider or rpcUrl provided");
    }

    provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  }

  const chainId = (await provider.getNetwork()).chainId.toString();

  if (!multicallContracts[chainId]) {
    throw new Error("Multicall contract not found for this chain");
  }

  const multiCallContract = new ethers.Contract(
    multicallContracts[chainId],
    [
      "function aggregate((address target, bytes callData)[] calls) external view returns (uint256 blockNumber, bytes[] returnData)",
    ],
    provider
  );

  const calls = data.map((approval) => {
    return {
      target: approval.token,
      callData: new ethers.utils.Interface([
        "function allowance(address owner, address spender) view returns (uint256)",
      ]).encodeFunctionData("allowance", [approval.from, approval.spender]),
    };
  });

  const [, returnData]: [string, string[]] = await multiCallContract.callStatic.aggregate(calls);

  const approvals = returnData.map((appr, index) => {
    const decoded = utils.defaultAbiCoder.decode(["uint256"], appr);
    return {
      token: data[index].token,
      spender: data[index].spender,
      amount: (decoded[0] as BigNumber).toString(),
      from: data[index].from,
    };
  });

  return approvals;
};
