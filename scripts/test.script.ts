// // Init dotenv
import * as dotenv from "dotenv";

import { BatchMultiSigCall, ethers } from "../src";
import FCTData from "./fct.json";

dotenv.config();

const randAddr = () => ethers.Wallet.createRandom().address;

async function main() {
  const FCT = BatchMultiSigCall.from(FCTData);

  console.time("getPaymentPerPayer");
  const paymentPerPayer = FCT.utils.getPaymentPerPayer({
    ethPriceInKIRO: "100000000000000",
  });
  console.timeEnd("getPaymentPerPayer");
  console.log(paymentPerPayer);

  console.time("getPaymentPerPayer2");
  const pp = FCT.utils.getPaymentPerPayer({
    ethPriceInKIRO: "1",
  });
  console.timeEnd("getPaymentPerPayer2");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
