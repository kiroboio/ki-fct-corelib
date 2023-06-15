import * as dotenv from "dotenv";

import { Interface } from "../src/helpers/Interfaces";
import { ethers } from "../src/index";
import { addresses } from "../src/methods/batchMultiSigCall";
import scriptData from "./scriptData";

dotenv.config();

const chainId = 1;

async function main() {
  const provider = new ethers.providers.JsonRpcProvider(scriptData[chainId].rpcUrl);
  const FCTController = new ethers.Contract(addresses[chainId].FCT_Controller, Interface.FCT_Controller, provider);

  const data = {
    name: await FCTController.NAME(),
    version: await FCTController.VERSION(),
    chainId,
    verifyingContract: FCTController.address,
    salt: await FCTController.UID(),
  };

  console.log(data);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
