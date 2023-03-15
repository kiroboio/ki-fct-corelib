import fs from "fs";
import path from "path";

import { BatchMultiSigCall } from "../src";
import FCTData from "./FCT_Failed.json";

const chainId = 5;
// { address: '0xa30e701c5290642844e956bd6808786e4fde8a15' }
const shouldBeAddress = "0x03357338ea477ff139170cf85c9a4063dfc03fc9";

async function main() {
  const FCT = BatchMultiSigCall.from(FCTData);

  const exportFCT = FCT.exportFCT();

  // Save FCT to file called FCT_Failed2.json
  fs.writeFileSync(path.join(__dirname, "FCT_Failed2.json"), JSON.stringify(exportFCT, null, 2));

  const address = FCT.utils.recoverAddress(FCTData.signatures[0]);

  console.log({ address });

  // const kiroPriceInETH = await utils.getKIROPrice({
  //   chainId,
  //   rpcUrl: scriptData[chainId].rpcUrl,
  // });

  // console.log("kiroPriceInETH", kiroPriceInETH);

  // const data = FCT.utils.getPaymentPerPayer({
  //   kiroPriceInETH,
  //   // kiroPriceInETH: "232396827114661021886157", // From calculation
  //   // kiroPriceInETH: "225924675135002911548683", // From calculation2
  //   // kiroPriceInETH: "2515671042171160012110", // From event
  // });

  // console.log(data);

  // const gasPerPayer = FCT.utils.getGasPerPayer();

  // console.log(gasPerPayer);
}

main()
  .then(() => {
    console.log("Done!");
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
