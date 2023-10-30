// Init dotenv
import * as dotenv from "dotenv";

import { BatchMultiSigCall } from "../src";
import FCTData from "./Failing.json";

dotenv.config();

async function main() {
  const FCT = BatchMultiSigCall.from(FCTData);

  const requiredApprovals = await FCT.utils.getAllRequiredApprovals();

  console.log("Required approvals: ", requiredApprovals);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
