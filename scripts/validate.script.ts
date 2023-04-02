import { BatchMultiSigCall } from "../src";
import FCTData from "./Failing_FCT.json";

const chainId = 5;

async function main() {
  const FCT = BatchMultiSigCall.from(FCTData);

  // Validate FCT
  const isValid = FCT.utils.isValid();
  console.log("FCT is valid:", isValid);

  // // Recover address for every signature
  // for (const signature of FCTData.signatures) {
  //   const recoveredAddress = FCT.utils.recoverAddress(signature);
  //   console.log("Recovered address:", recoveredAddress);
  // }

  // const price = await utils.getKIROPrice({
  //   chainId: 1,
  //   rpcUrl: scriptData[1].rpcUrl,
  // });

  // console.log("KIRO price:", price);

  // const perPayer = FCT.utils.getPaymentPerPayer({
  //   kiroPriceInETH: price,
  // });

  // console.log("Payment per payer:", perPayer);
}

main()
  .then(() => {
    console.log("Done!");
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
