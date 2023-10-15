import { BatchMultiSigCall } from "../src";
import FCTData from "./FailingFCTExport.json";

async function main() {
  const FCT = BatchMultiSigCall.from(FCTData);

  const data = FCT.exportFCT();
  console.log(data);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
