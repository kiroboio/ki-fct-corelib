import * as dotenv from "dotenv";

import FCTJSON from "../FCT.json";
import { utils } from "../src/index";
import data from "./scriptData";
// 34149170958632548614943

dotenv.config();

const chainId = 5;
const wallet = process.env.WALLET as string;
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

async function main() {
  const gasPrices = await utils.getGasPrices({
    rpcUrl: data[chainId].rpcUrl,
  });

  console.log("Gas Prices", gasPrices);

  const FCT = utils.validateFCT(FCTJSON);

  console.log(FCT.getOptions());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
