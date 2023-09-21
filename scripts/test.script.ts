import { writeFileSync } from "fs";

import { BatchMultiSigCall } from "../src";
import FCTData from "./FailingFCT.json";

async function main() {
  const FCT = BatchMultiSigCall.from(FCTData);

  const exported = FCT.export();
  writeFileSync("./scripts/FailingFCTExport.json", JSON.stringify(exported, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
