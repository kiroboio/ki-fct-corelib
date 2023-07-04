import { BatchMultiSigCall } from "../src";
import FailingFCT from "./Failing.json";

async function main() {
  const FCT = BatchMultiSigCall.from(FailingFCT);

  console.log(JSON.stringify(FCT.calls, null, 2));

  console.log(FCT.utils.isValid());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
