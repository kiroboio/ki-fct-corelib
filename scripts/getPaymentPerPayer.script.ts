import FCTData from "../FCTExample.json";
import { BatchMultiSigCall, ethers } from "../src";

const kiroPerETH = BigInt("0x62eb71d53b26def2939").toString();
const gasPrice = ethers.utils.parseUnits("200", "gwei").toNumber();

async function main() {
  const FCT = BatchMultiSigCall.from(FCTData); // Returns BatchMultiSigCall class
  const payerPayments = FCT.utils.getPaymentPerPayer({
    ethPriceInKIRO: kiroPerETH,
    // gas: "367463",
    maxGasPrice: gasPrice.toString(),
  }); // Return { ethCost: '5292113328198587', kiroCost: '154508243943700685641' }

  console.log(payerPayments);
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
