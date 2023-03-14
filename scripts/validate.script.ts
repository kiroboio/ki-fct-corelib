import { BatchMultiSigCall } from "../src";
import FCTData from "./FCT_Failed.json";

async function main() {
  const FCT = BatchMultiSigCall.from(FCTData);

  const data = FCT.utils.getPaymentPerPayer({
    // kiroPriceInETH: "232396827114661021886157", // From calculation
    kiroPriceInETH: "225924675135002911548683", // From calculation2

    // kiroPriceInETH: "2515671042171160012110", // From event
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
