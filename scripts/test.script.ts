import { BatchMultiSigCall } from "../src";
// import FCTData from "./FailingFCTExport.json";

async function main() {
  const FCT = new BatchMultiSigCall({
    chainId: "1",
    options: {
      name: "Untitled",
      dryRun: false,
      app: {
        name: "",
        version: "",
      },
      builder: {
        name: "",
        address: "0x0000000000000000000000000000000000000000",
      },
      domain: "",
      verifier: "",
      id: "",
      validFrom: "1698075061",
      expiresAt: "1698703199",
      maxGasPrice: "100000000000",
      blockable: true,
      purgeable: false,
      authEnabled: false,
    },
  });

  const data = FCT.exportFCT();
  console.log(data);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
