import { BatchMultiSigCall } from "../src";
import FCTData from "./FCT_Failed.json";

async function main() {
  const FCT = BatchMultiSigCall.from(FCTData);

  const data = FCT.utils.getPaymentPerPayer({
    kiroPriceInETH: "13715073753874304248581",
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
