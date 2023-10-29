// Init dotenv
import * as dotenv from "dotenv";

import { BatchMultiSigCall } from "../src";
import FCTData from "./Failing.json";

dotenv.config();

async function main() {
  const FCT = BatchMultiSigCall.from(FCTData);

  const data = await FCT.utils.getAllRequiredApprovals();

  console.log("data", data);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
