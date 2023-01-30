import * as dotenv from "dotenv";

import { utils } from "../src/index";
import scriptData from "./scriptData";

dotenv.config();

const chainId = 5;

async function main() {
  const gasPrices = await utils.getGasPrices({
    rpcUrl: scriptData[chainId].rpcUrl,
  });

  console.log(gasPrices);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
