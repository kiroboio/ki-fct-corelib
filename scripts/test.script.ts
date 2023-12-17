// // Init dotenv
import * as dotenv from "dotenv";

import { BatchMultiSigCall, ethers } from "../src";
import FCTData from "./fct.json";

dotenv.config();

const randAddr = () => ethers.Wallet.createRandom().address;

async function main() {
  const FCT = BatchMultiSigCall.fromMap(FCTData.data, {
    calls: [
      "6b96ea03-24ad-42dd-a9f8-0608ff521b25",
      "75c020ca-30de-4b5e-a4c7-c8a32168912a",
      "54b767bb-97fc-4f8b-9005-d284f143a25e",
      "6bb8b112-2a15-4f7a-896c-b28465449410",
      "83694499-0967-453d-b54c-a7a726a17bd1",
      "fe8ee5f1-cb05-48c2-915d-d61464f6ae06",
      "c25c017d-1c7e-4518-bdb9-a80be5891798",
      "93dc7aee-1d04-4ddd-a13d-6173a8b61734",
      "19e7d921-d5ec-4920-86ba-f90df2c37167",
    ],
    computed: ["aedb44ef-aaec-42b5-9f52-01bc16dbdaa6"],
    validations: ["582765e8-6085-4646-90d0-dabc7e45688e", "86a6c05e-d4c3-4ca1-b74f-7722c7fea949"],
  });

  // console.log(
  //   JSON.stringify(
  //     FCT.calls.map((call) => call.call),
  //     null,
  //     2,
  //   ),
  // );

  const trace = await FCT.utils.getTransactionTrace({
    tenderlyRpcUrl: process.env.TENDERLY_RPC_URL as string,
    txHash: "0x656493fdc44de7330edf9f3e7a6f4ab3e404716f624589070f030d6f17e2cc74",
  });

  console.log(JSON.stringify(trace, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
