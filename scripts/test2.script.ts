// // Init dotenv
import * as dotenv from "dotenv";

import { BatchMultiSigCall, ethers } from "../src";
// import FCTData from "./fail.json";

dotenv.config();

const randAddr = () => ethers.Wallet.createRandom().address;

async function main() {
  const FCT = new BatchMultiSigCall({ chainId: "1" });

  await FCT.add({
    to: randAddr(),
    from: randAddr(),
    value: "123",
    options: {
      gasLimit: "40000",
      payerIndex: 0,
    },
  });

  const payments = FCT.utils.getPaymentPerPayer({
    ethPriceInKIRO: "123",
  });

  console.log(payments);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
