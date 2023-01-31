import * as dotenv from "dotenv";

import FCTControllerABI from "../src/abi/FCT_Controller.abi.json";
import { ethers } from "../src/index";
import scriptData from "./scriptData";

dotenv.config();

const chainId = 5;

async function main() {
  const provider = new ethers.providers.JsonRpcProvider(scriptData[chainId].rpcUrl);

  const FCTController = new ethers.Contract("0x087550a787B2720AAC06351065afC1F413D82572", FCTControllerABI, provider);

  const data = {
    name: await FCTController.NAME(),
    version: await FCTController.VERSION(),
    chainId: 5,
    verifyingContract: FCTController.address,
    salt: await FCTController.UID(),
  };

  console.log(data);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});