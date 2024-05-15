import * as dotenv from "dotenv";

import { constants } from "../src";
import { Interfaces } from "../src/helpers/Interfaces";
import { ethers } from "../src/index";
import scriptData from "./scriptData";

const addresses = constants.addresses;
dotenv.config();

const chainId = 8453;

async function main() {
  const provider = new ethers.providers.JsonRpcProvider(scriptData[chainId].rpcUrl);
  const FCTController = new ethers.Contract(addresses[chainId].FCT_Controller, Interfaces.FCT_Controller, provider);

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
