// // Init dotenv
import * as dotenv from "dotenv";

import { BatchMultiSigCall, ethers } from "../src";
import FCTData from "./mcallFct.json";

dotenv.config();

const randAddr = () => ethers.Wallet.createRandom().address;

async function main() {
  const FCT = BatchMultiSigCall.fromMap(FCTData.data, {
    calls: ["4d27b519-7d01-437f-8a1e-aefc59e0ad5a"],
    computed: [],
    validations: [],
  });

  const trace = await FCT.utils.getTransactionTrace({
    tenderlyRpcUrl: `https://goerli.gateway.tenderly.co/${process.env.TENDERLY_KEY as string}`,
    txHash: "0x8f29a71a893733d24e079c9a0518aed4c04cc766ab8c2a37c39fab259bf2dc59",
  });

  console.log(JSON.stringify(trace, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
