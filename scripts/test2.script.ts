import { ethers } from "ethers";

import FCTData from "../fct.json";
import { BatchMultiSigCall } from "../src";

const createRandomAddress = () => ethers.Wallet.createRandom().address;

async function main() {
  const FCT = BatchMultiSigCall.from(FCTData);
  const authenticatorSignature = FCT.utils.getAuthenticatorSignature();

  const exportFCT = FCT.exportFCT();

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
