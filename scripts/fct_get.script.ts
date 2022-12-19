import * as dotenv from "dotenv";
import { ethers } from "ethers";
import fs from "fs";

import { BatchMultiSigCall } from "../src/batchMultiSigCall";
dotenv.config();

const FCT_Controller_Rinkeby = "0xD614c22fb35d1d978053d42C998d0493f06FB440";

async function main() {
  console.log("getting fct\n");
  const batchMultiSigCall = new BatchMultiSigCall({
    provider: new ethers.providers.JsonRpcProvider("https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161"),
    contractAddress: FCT_Controller_Rinkeby,
  });

  const fct = fs.readFileSync("fct.json");
  batchMultiSigCall.importFCT(JSON.parse(fct.toString()));

  for (let i = 0; i < batchMultiSigCall.calls.length; ++i) {
    console.log(`call ${i + 1}`);
    console.log("~".repeat(10));
    try {
      const plugin = await batchMultiSigCall.getPlugin(i);
      console.log(JSON.stringify(plugin));
      const p = new plugin.plugin({});
      const { _protocol, _type, _method } = p;
      console.log(JSON.stringify({ _protocol, _type, _method }));
    } catch (e) {
      // console.log('error', e);
      const call = batchMultiSigCall.calls[i];
      console.log(`eth transfer: from: ${call.from}, to: ${call.to}, wei: ${call.value}`);
    }
    console.log("-".repeat(160));
    console.log("-".repeat(160).concat("\n"));
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
