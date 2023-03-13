import { BatchMultiSigCall } from "../src";
import FCTData from "./FCT_Failed.json";

async function main() {
  const FCT = BatchMultiSigCall.from(FCTData);

  const data = FCT.utils.getPaymentPerPayer({
    // kiroPriceInETH: "1175658011775855131063", // From calculation
    kiroPriceInETH: "2515671042171160012110", // From event
  });

  console.log(data);
}

main()
  .then(() => {
    console.log("Done!");
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
