// // Init dotenv
import * as dotenv from "dotenv";

import { ethers } from "../src";
import scriptData from "./scriptData";

dotenv.config();

const ChainID = "10";

async function main() {
  const provider = new ethers.providers.JsonRpcProvider(scriptData[ChainID].rpcUrl);
  const activatorKey = process.env.ACTIVATOR_PRIVATE_KEY as string;

  const Activator = new ethers.Wallet(activatorKey, provider);

  const tx = await Activator.sendTransaction({
    to: "0x19B272A2f2C5B4673057397390909757a0033633",
    value: ethers.utils.parseEther("0.004"),
  });
  console.log(tx);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
