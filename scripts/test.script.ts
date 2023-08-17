import { ethers } from "ethers";

import { BatchMultiSigCall } from "../src";
import fctJson from "./FailingFCT.json";

const createRandomAddress = () => ethers.Wallet.createRandom().address;

async function main() {
  const FCT = BatchMultiSigCall.from(fctJson);

  console.log(FCT.callsAsObjects);

  const FCTData = FCT.export();

  console.log(JSON.stringify(FCTData, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
