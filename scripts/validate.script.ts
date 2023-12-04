import { writeFileSync } from "fs";

import { BatchMultiSigCall } from "../src";
import FCTData from "./myFCT.json";
const activator = "0x4c508dc4a3aacbecbf13c1d543b4936274033110";

async function main() {
  const FCT = BatchMultiSigCall.from(FCTData);

  const data = FCT.export();

  writeFileSync("./scripts/myFCT2.json", JSON.stringify(data, null, 2));

  // const signatures = FCT.utils.getAuthenticatorSignature();

  // console.log(signatures);

  // const data = await utils.transactionValidator({
  //   rpcUrl: scriptData[5].rpcUrl,
  //   activateForFree: false,
  //   activator: activator,
  //   actuatorContractAddress: scriptData[5].Actuator,
  //   callData: FCT.utils.getCalldataForActuator({
  //     signatures
  //   })
  // });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
