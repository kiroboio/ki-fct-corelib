import * as dotenv from "dotenv";

import { ethers, utils } from "../src/index";
import FCT from "./ERC20TransferFCT.json";
import data from "./scriptData";
// 34149170958632548614943

dotenv.config();

const chainId = 5;
const wallet = process.env.WALLET as string;
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

async function main() {
  const provider = new ethers.providers.JsonRpcProvider(data[chainId].rpcUrl);

  const cost = utils.getMaxKIROCostPerPayer({
    fct: FCT,
    kiroPriceInETH: "34149170958632548614943",
  });

  console.log("Cost", cost);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
