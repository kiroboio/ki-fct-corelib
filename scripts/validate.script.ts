import { BatchMultiSigCall } from "../src";
import FCTData from "./Failing_FCT.json";

const chainId = 5;

async function main() {
  const FCT = BatchMultiSigCall.from(FCTData);

  const tx = await FCT.utils.deepValidateFCT({
    actuatorAddress: "0xC434b739d2DaC17279f8fA1B66C0C7381df4909b",
    rpcUrl: "https://goerli.infura.io/v3/99229ae47ba74d21abc557bdc503a5d9",
    signatures: FCTData.signatures,
  });

  console.log(tx);
}

main()
  .then(() => {
    console.log("Done!");
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
