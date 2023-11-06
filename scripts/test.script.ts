// Init dotenv
import * as dotenv from "dotenv";

import { BatchMultiSigCall, ethers } from "../src";
import { transactionValidator } from "../src/utils";
import FCTData from "./Failing.json";
import { scriptData } from "./scriptData";

dotenv.config();

async function main() {
  const FCT = BatchMultiSigCall.from(FCTData);
  const txValidator = await transactionValidator({
    callData: FCT.utils.getCalldataForActuator({
      activator: ethers.constants.AddressZero,
      investor: ethers.constants.AddressZero,
      purgedFCT: ethers.constants.HashZero,
      signatures: FCTData.signatures,
    }),
    activateForFree: false,
    actuatorContractAddress: process.env.ACTIVATOR as string,
    actuatorPrivateKey: process.env.ACTIVATOR_PRIVATE_KEY as string,
    rpcUrl: scriptData[5].rpcUrl,
    gasPrice: {
      maxFeePerGas: "150000000",
      maxPriorityFeePerGas: "0",
    },
  });

  console.log(txValidator);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
