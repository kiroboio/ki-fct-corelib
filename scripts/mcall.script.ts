import { ethers } from "ethers";

import { Interfaces } from "../src/helpers/Interfaces";
import scriptData from "./scriptData";

async function main() {
  const provider = new ethers.providers.JsonRpcProvider(scriptData[1].rpcUrl);
  const MulticallContract = new ethers.Contract(
    "0x5ba1e12693dc8f9c48aad8770482f4739beed696",
    Interfaces.Multicall,
    provider
  );

  const BalanceCheckerContract = new ethers.Contract(
    "0xb1f8e55c7f64d203c1400b9d8555d050f94adf39",
    ["function balances(address[] users, address[] tokens) external view returns (uint[])"],
    provider
  );

  const gasMulticall = await MulticallContract.estimateGas.aggregate([
    {
      target: scriptData[1].USDC,
      callData: Interfaces.ERC20.encodeFunctionData("balanceOf", ["0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B"]),
    },
    {
      target: "0x5ba1e12693dc8f9c48aad8770482f4739beed696",
      callData: Interfaces.Multicall.encodeFunctionData("getEthBalance", [
        "0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B",
      ]),
    },
    {
      target: scriptData[1].USDC,
      callData: Interfaces.ERC20.encodeFunctionData("balanceOf", ["0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B"]),
    },
    {
      target: "0x5ba1e12693dc8f9c48aad8770482f4739beed696",
      callData: Interfaces.Multicall.encodeFunctionData("getEthBalance", [
        "0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B",
      ]),
    },
    {
      target: scriptData[1].USDC,
      callData: Interfaces.ERC20.encodeFunctionData("balanceOf", ["0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B"]),
    },
    {
      target: "0x5ba1e12693dc8f9c48aad8770482f4739beed696",
      callData: Interfaces.Multicall.encodeFunctionData("getEthBalance", [
        "0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B",
      ]),
    },
  ]);

  const gasBalanceChecker = await BalanceCheckerContract.estimateGas.balances(
    [
      "0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B",
      "0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B",
      "0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B",
    ],
    [scriptData[1].USDC, ethers.constants.AddressZero]
  );

  console.log("gasMulticall", gasMulticall.toString());
  console.log("gasBalanceChecker", gasBalanceChecker.toString());
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
