import * as dotenv from "dotenv";

import FCT from "../FCT2.json";
import { BatchMultiSigCall, utils } from "../src";
import scriptData from "./scriptData";
dotenv.config();

const chainId = "5";

async function main() {
  const gasPrices = await utils.getGasPrices({
    rpcUrl: scriptData[chainId].rpcUrl,
  });
  const fct = new BatchMultiSigCall({
    chainId,
  });
  fct.importFCT(FCT);
  const plugin = await fct.getPluginData(0);
  console.log("Plugin data", plugin);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
