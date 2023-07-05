import { ethers } from "ethers";

import { BatchMultiSigCall } from "../src";
import FailingFCT from "./Failing.json";

async function main() {
  const FCT = BatchMultiSigCall.from(FailingFCT);

  const fctData = FCT.exportFCT();

  const calldata = FCT.utils.getCalldataForActuator({
    signatures: [],
    activator: ethers.constants.AddressZero,
    investor: ethers.constants.AddressZero,
    purgedFCT: ethers.constants.HashZero,
  });

  console.log(JSON.stringify(fctData, null, 2));
  console.log(calldata);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
