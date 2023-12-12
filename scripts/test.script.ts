// // Init dotenv
import * as dotenv from "dotenv";

import { BatchMultiSigCall, ethers } from "../src";
import FCTData from "./fct.json";

dotenv.config();

const randAddr = () => ethers.Wallet.createRandom().address;

async function main() {
  const FCT = BatchMultiSigCall.from(FCTData);

  const data = await FCT.utils.getTransactionTrace({
    tenderlyRpcUrl: process.env.TENDERLY_RPC_URL as string,
    txHash: "0x16f6c8905c4ff692fd84323fae2ca13e6b5806c5712f5f308761d22a33c3a101",
  });

  console.log(JSON.stringify(data, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
