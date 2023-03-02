import * as dotenv from "dotenv";
import fs from "fs";

// import { BatchMultiSigCall } from "../src";
import FCTData from "../FCT.json";
import { BatchMultiSigCall } from "../src";

dotenv.config();

async function main() {
  const FCT = BatchMultiSigCall.from(FCTData);

  const exportFCT = FCT.exportFCT();

  fs.writeFileSync("FCT.json", JSON.stringify(exportFCT, null, 2));
}

main()
  .then(() => {
    console.log("Done");
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
