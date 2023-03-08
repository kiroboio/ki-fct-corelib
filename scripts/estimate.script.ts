import * as dotenv from "dotenv";

import FCTExample from "../FCTExample.json";
import { BatchMultiSigCall, utils } from "../src";
import { FetchUtility } from "../src/utils";
import scriptData from "./scriptData";
dotenv.config();

const chainId = "5";

// Address
const randomAddress = "0x" + "0".repeat(40);
// USDC contract address
const USDC = "0x2791bca1f2de4661ed88a30c99a7a9449aa84174";
const USDT = "0xc2132d05d31c914a87c6611c10748aeb04b58e8f";

async function main() {
  const gasPrices = await utils.getGasPrices({
    rpcUrl: scriptData[chainId].rpcUrl,
  });

  const FCT = BatchMultiSigCall.from(FCTExample);

  // Require approvals
  const approvals = await FCT.utils.getAllRequiredApprovals();

  console.log("Approvals required: ", approvals);

  const fetchUtil = new FetchUtility({
    chainId: "5",
    rpcUrl: scriptData[chainId].rpcUrl,
  });

  const totalSupplies = await fetchUtil.getTokensTotalSupply(approvals);

  console.log("Total supplies: ", totalSupplies);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
