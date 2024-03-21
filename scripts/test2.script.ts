// // Init dotenv
import * as dotenv from "dotenv";

import { BatchMultiSigCall, ethers } from "../src";
import FCTData from "./jj.json";

dotenv.config();

const randAddr = () => ethers.Wallet.createRandom().address;

async function main() {
  const FCT = BatchMultiSigCall.from(FCTData);

  // All paths
  const routes = FCT.utils.getAllPaths();
  console.log(routes);

  const payments = FCT.utils.getPaymentPerPayer({
    ethPriceInKIRO: "123",
  });
  console.log(payments);
  // const FCT = new BatchMultiSigCall({ chainId: "1" });

  // await FCT.add({
  //   to: randAddr(),
  //   from: randAddr(),
  //   value: "123",
  //   options: {
  //     gasLimit: "40000",
  //     payerIndex: 0,
  //   },
  // });

  // const payments = FCT.utils.getPaymentPerPayer({
  //   ethPriceInKIRO: "123",
  // });

  // console.log(payments);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
