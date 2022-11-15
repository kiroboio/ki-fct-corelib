import { ethers } from "ethers";
import data from "./scriptData";

async function main() {
  const chainId = 1;
  const abi = [
    "event Swap(address indexed reserve, address indexed user, uint256 rateMode)",
    "event Withdraw(address indexed reserve, address indexed user, address indexed to, uint256 amount)",
    `event Repay(address indexed reserve, address indexed user, address indexed repayer, uint256 amount)`,
    "event FlashLoan(address indexed target, address indexed initiator, address indexed asset, uint256 amount, uint256 premium, uint16 referralCode)",
  ];

  const provider = new ethers.providers.JsonRpcProvider(data[chainId].rpcUrl);
  const contract = new ethers.Contract("0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9", abi, provider);

  const data2 = await contract.queryFilter("FlashLoan", -2000, "latest");

  console.log(data2);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
