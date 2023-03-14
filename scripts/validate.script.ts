import { BatchMultiSigCall, utils } from "../src";
import FCTData from "./FCT_Failed.json";
import scriptData from "./scriptData";

const chainId = 5;

async function main() {
  const FCT = BatchMultiSigCall.from(FCTData);

  const kiroPriceInETH = await utils.getKIROPrice({
    chainId,
    rpcUrl: scriptData[chainId].rpcUrl,
  });

  console.log("kiroPriceInETH", kiroPriceInETH);

  const data = FCT.utils.getPaymentPerPayer({
    kiroPriceInETH,
    // kiroPriceInETH: "232396827114661021886157", // From calculation
    // kiroPriceInETH: "225924675135002911548683", // From calculation2
    // kiroPriceInETH: "2515671042171160012110", // From event
  });

  console.log(data);

  const gasPerPayer = FCT.utils.getGasPerPayer();

  console.log(gasPerPayer);
}

main()
  .then(() => {
    console.log("Done!");
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
