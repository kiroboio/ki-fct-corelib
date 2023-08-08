import { ethers } from "ethers";

import { BatchMultiSigCall } from "../src";
import FCTData from "./fct.json";

const createRandomAddress = () => ethers.Wallet.createRandom().address;

async function main() {
  const FCT = BatchMultiSigCall.from(FCTData);

  console.log("Import successful");
  console.log(FCT.validations);
  const authenticatorSignature = FCT.utils.getAuthenticatorSignature();
  const exportFCT = FCT.exportFCT();

  console.log(JSON.stringify(exportFCT, null, 2));

  const FCT2 = BatchMultiSigCall.from(exportFCT);
  const recoverAddress = FCT2.utils.recoverAddress(authenticatorSignature);
  console.log(recoverAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
