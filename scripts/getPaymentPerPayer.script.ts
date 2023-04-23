import FCTData from "../FCTExample.json";
import { BatchMultiSigCall, ethers } from "../src";
// import scriptData from "./scriptData";
const chainId = 5;

async function main() {
  const FCT = BatchMultiSigCall.from(FCTData);
  const kiroPerETH = BigInt("0x62eb71d53b26def2939").toString();

  const gasPrice = ethers.utils.parseUnits("9.69", "gwei").toNumber();

  const payers = FCT.utils.getPaymentPerPayer({
    ethPriceInKIRO: kiroPerETH,
    signatures: FCTData.signatures,
    gasPrice,
  });

  console.log(payers);
  // Real fee             116213905426644680000 (116.21390542664468)
  // Fee from calculation 154508243943700685641 (154.50824394370068)

  // Difference is because a big gas limit is for mcall[0] (pretty sure it uses a lot less)
}

main()
  .then(() => {
    console.log("Done!");
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
