import { getGasPrices } from "../src/utils";
// import FCTData from "./FCT_Failed.json";
import scriptData from "./scriptData";

const chainId = 5;

async function main() {
  const gasPrices = await getGasPrices({
    chainId,
    rpcUrl: scriptData[5].rpcUrl,
  });

  console.log("Gas prices:", gasPrices);

  // const FCT = BatchMultiSigCall.from(FCTData);

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
