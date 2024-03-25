// // Init dotenv
import * as dotenv from "dotenv";

import { BatchMultiSigCall, ethers } from "../src";
import FCTData from "./fct.json";

dotenv.config();

const randAddr = () => ethers.Wallet.createRandom().address;

async function main() {
  const FCT = BatchMultiSigCall.from(FCTData);

  // All paths
  const routes = FCT.utils.getAllPaths();
  console.log(routes);

  const payments = FCT.utils.getPaymentPerPayer({
    ethPriceInKIRO: "123000000000",
  });
  console.log(payments);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
