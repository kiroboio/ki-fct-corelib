import * as dotenv from "dotenv";

import { utils } from "../src";
import scriptData from "./scriptData";
dotenv.config();

const chainId = "5";

async function main() {
  const gasPrices = await utils.getGasPrices({
    rpcUrl: scriptData[chainId].rpcUrl,
  });
  console.log("Gas prices", gasPrices);

  // const fct = new BatchMultiSigCall({
  //   chainId,
  // });
  // fct.importFCT(FCT);
  // const plugin = await fct.getPluginData(0);
  // console.log("Plugin data", plugin);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
