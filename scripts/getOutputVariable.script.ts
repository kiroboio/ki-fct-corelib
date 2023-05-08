import { BatchMultiSigCall } from "../src";

async function main() {
  const FCT = new BatchMultiSigCall();
  const outputVariable = FCT.variables.getOutputVariable({
    innerIndex: 0,
    index: 0,
  });

  console.log(outputVariable);
}

main()
  .then(() => {
    console.log("Done!");
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
