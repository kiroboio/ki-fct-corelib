import { ethers } from "ethers";

import { BatchMultiSigCall } from "../src";
import FCTData from "./fct.json";

const createRandomAddress = () => ethers.Wallet.createRandom().address;

async function main() {
  const FCT = BatchMultiSigCall.from(FCTData);
  const authenticatorSignature = FCT.utils.getAuthenticatorSignature();

  FCT.addComputed({
    id: "2",
    value1: { type: "computed", id: "1" },
    operator1: "+",
    value2: "1",
  });

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
