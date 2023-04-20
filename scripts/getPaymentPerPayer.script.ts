import FCTData from "../FCTExample.json";
import { BatchMultiSigCall, ethers } from "../src";
// import scriptData from "./scriptData";
const chainId = 5;

async function main() {
  const FCT = BatchMultiSigCall.from(FCTData);
  const kiroPerETH = BigInt("0x62eb71d53b26def2939").toString();

  const gasPrice = ethers.utils.parseUnits("9.69", "gwei").toNumber();

  const payers = FCT.utils.getPaymentPerPayerV2({
    priceOfETHInKiro: kiroPerETH,
    signatures: FCTData.signatures,
    gasPrice,
  });

  console.log(payers);
}

main()
  .then(() => {
    console.log("Done!");
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
