import { Uniswap } from "@kirobo/ki-eth-fct-provider-ts";
import * as dotenv from "dotenv";
import { ethers } from "ethers";

import { utils } from "../src";
import { BatchMultiSigCall } from "../src/batchMultiSigCall";
import data from "./scriptData";

dotenv.config();
// eslint-disable-next-line
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

function getDate(days = 0) {
  const result = new Date();
  result.setDate(result.getDate() + days);
  return Number(result.getTime() / 1000).toFixed();
}

// eslint-disable-next-line
function addHours(numOfHours: number, date = new Date()) {
  date.setTime(date.getTime() + numOfHours * 60 * 60 * 1000);

  return Number(date.getTime() / 1000).toFixed();
}

const chainId = "5";
const wallet = process.env.WALLET as string;

async function main() {
  const vault = process.env.VAULT as string;
  const key = process.env.PRIVATE_KEY as string;

  const batchMultiSigCall = new BatchMultiSigCall({
    chainId: "5",
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
  ]);

  const requiredApprovals = batchMultiSigCall.getAllRequiredApprovals();
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
