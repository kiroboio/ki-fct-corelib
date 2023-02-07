import * as dotenv from "dotenv";

import FCT from "../FCT2.json";
import { verifyOptions } from "../src/batchMultiSigCall/helpers";
import { BatchMultiSigCall, utils } from "../src/index";
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

  fct.setOptions({
    recurrency: {
      chillTime: "0.2",
    },
  });

  verifyOptions(fct.options);

  fct.importFCT(FCT);

  const plugin = await fct.getPluginData(0);
  console.log("Plugin data", plugin);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
