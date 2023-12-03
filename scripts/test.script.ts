// Init dotenv
import console from "console";
import * as dotenv from "dotenv";

// https://testapi.kirobo.me/v1/eth/goerli/fct/getfct/<message hash>?key=process.env.LIOR_SERVICE_KEY
import { BatchMultiSigCall, ethers } from "../src";
import FCTData from "./aLotOfGasFCT.json";

dotenv.config();

const activator = "0x4c508dc4a3aacbecbf13c1d543b4936274033110";
const receiver = ethers.Wallet.createRandom().address;

async function main() {
  const FCT = BatchMultiSigCall.from(FCTData);

  const cost = await FCT.utils.getTransactionTrace({
    txHash: "0xdeb0cd37577fd85db3e0cb8ac0b91bfcf77a2274cdc7e51195e4af78e3d21fa5",
    tenderlyRpcUrl: process.env.TENDERLY_RPC_URL as string,
  });

  console.log(JSON.stringify(cost, null, 2));

  // const provider = new ethers.providers.JsonRpcProvider(process.env.TENDERLY_RPC_URL as string);

  // const data = await provider.send("tenderly_traceTransaction", [
  //   "0xdeb0cd37577fd85db3e0cb8ac0b91bfcf77a2274cdc7e51195e4af78e3d21fa5",
  // ]);

  // const traces = data.trace
  //   .filter((call) => {
  //     // 0x0496ce2a

  //     const actualCall =
  //       call.traceAddress.length === 7 &&
  //       call.traceAddress[0] === 0 &&
  //       call.traceAddress[1] === 0 &&
  //       call.traceAddress[3] === 0 &&
  //       call.traceAddress[4] === 0 &&
  //       call.traceAddress[5] === 2 &&
  //       call.traceAddress[6] === 2;

  //     const fctCall = call.to === "0x5eb0a4366d4ae285e96af8ea22a853f1ef91f1eb" && call.input.startsWith("0x0496ce2a");

  //     return actualCall || fctCall;
  //   })
  //   .map((call) => ({ ...call, gasUsed: parseInt(call.gasUsed, 16), gas: parseInt(call.gas, 16) }));

  // writeFileSync("./asafTxTrace.json", JSON.stringify(traces, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
