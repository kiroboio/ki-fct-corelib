import data from "../FCT.json";
import { BatchMultiSigCall } from "../src";

async function main() {
  const FCT = new BatchMultiSigCall({
    chainId: "5",
  });
  FCT.importFCT(data);
}

main()
  .then(() => {
    console.log("Done");
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
