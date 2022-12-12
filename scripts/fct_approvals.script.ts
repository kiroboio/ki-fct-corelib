import { BatchMultiSigCall } from "../src/batchMultiSigCall";
import { ethers } from "ethers";
import * as dotenv from "dotenv";
import { ERC20, Uniswap } from "@kirobo/ki-eth-fct-provider-ts";
import data from "./scriptData";
import { utils } from "../src";

dotenv.config();
// eslint-disable-next-line
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

function getDate(days: number = 0) {
  const result = new Date();
  result.setDate(result.getDate() + days);
  return Number(result.getTime() / 1000).toFixed();
}

// eslint-disable-next-line
function addHours(numOfHours: number, date = new Date()) {
  date.setTime(date.getTime() + numOfHours * 60 * 60 * 1000);

  return Number(date.getTime() / 1000).toFixed();
}

const chainId = 1;
const wallet = process.env.WALLET as string;

async function main() {
  const vault = process.env.VAULT as string;
  const key = process.env.PRIVATE_KEY as string;

  const batchMultiSigCall = new BatchMultiSigCall({
    provider: new ethers.providers.JsonRpcProvider(data[chainId].rpcUrl),
    contractAddress: "0x8e5bBbb09Ed1ebdE8674Cda39A0c169401db4252",
  });

  batchMultiSigCall.setOptions({
    maxGasPrice: "3000000000",
    expiresAt: getDate(10),
    recurrency: {
      accumetable: true,
      maxRepeats: "1000",
      chillTime: "1",
    },
  });

  const transfer = new ERC20.actions.Transfer({
    chainId: "1",
    initParams: {
      to: data[chainId].KIRO,
      methodParams: {
        recipient: wallet,
        amount: ethers.utils.parseUnits("1", 18).toString(),
      },
    },
  });

  const swap = new Uniswap.actions.UniswapV2SwapExactTokensForETH({
    chainId: "1",
  });

  swap.input.set({
    methodParams: {
      amountIn: "1000",
      amountOutMin: "1",
      path: [data[chainId].KIRO, data[chainId].USDC],
      to: vault,
    },
  });

  await batchMultiSigCall.createMultiple([
    {
      from: vault,
      nodeId: "1",
      value: "100",
      params: [],
      to: data[chainId].KIRO,
    },
    { plugin: swap, nodeId: "2", from: vault },
    // { plugin: transfer, from: vault, nodeId: "3" },
  ]);

  const requiredApprovals = await batchMultiSigCall.getAllRequiredApprovals();
  console.log("approvals from core lib", requiredApprovals);

  const approvals = await utils.fetchCurrentApprovals({
    provider: new ethers.providers.JsonRpcProvider(data[chainId].rpcUrl),
    data: requiredApprovals,
  });

  console.log("approvals from utils", approvals);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
