import * as dotenv from "dotenv";
import { ethers } from "ethers";

import { BatchMultiSigCall } from "../src";

dotenv.config();

const chainId = "1";
async function main() {
  const vault = process.env.VAULT as string;
  const key = process.env.PRIVATE_KEY as string;

  // Get address from private key
  const address = ethers.utils.computeAddress("0x" + key);
  console.log("address", address);

  const FCT = new BatchMultiSigCall({
    chainId,
  });
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
