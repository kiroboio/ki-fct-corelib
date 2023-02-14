import * as dotenv from "dotenv";

import data from "../FCT2.json";
import { BatchMultiSigCall, utils } from "../src";
import scriptData from "./scriptData";

dotenv.config();
const key = process.env.PRIVATE_KEY as string;

async function main() {
  const gasPrices = await utils.getGasPrices({
    rpcUrl: scriptData[5].rpcUrl,
  });
  const FCT = new BatchMultiSigCall({
    chainId: "5",
  });
  FCT.importFCT(data);

  const requiredApprovals = FCT.getAllRequiredApprovals();
  console.log(requiredApprovals);
}

main()
  .then(() => {
    console.log("Done");
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
