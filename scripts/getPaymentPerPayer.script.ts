import FCTData from "../FCTExample.json";
import { BatchMultiSigCall, ethers } from "../src";

const chainId = 5;

const kiroPerETH = BigInt("0x62eb71d53b26def2939").toString();
const gasPrice = ethers.utils.parseUnits("200", "gwei").toNumber();

async function main() {
  const FCT = BatchMultiSigCall.from(FCTData); // Returns BatchMultiSigCall class
  const payerPayments = FCT.utils.getPaymentPerPayer({
    ethPriceInKIRO: kiroPerETH,
    // gas: "367463",
    maxGasPrice: gasPrice.toString(),
  }); // Return { ethCost: '5292113328198587', kiroCost: '154508243943700685641' }

  // const payers = FCT.utils.getPaymentPerPayer({
  //   ethPriceInKIRO: kiroPerETH,
  //   signatures: FCTData.signatures,
  //   gasPrice,
  // });

  // console.log(payers);
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

// [
//   {
//     payer: "0x2372808701640f91c0CbF581981237Aeb686249d",
//     largestPayment: {
//       gas: "776782",
//       amount: "680366511281399988084",
//       amountInETH: "23303460000000000",
//     },
//     smallestPayment: {
//       gas: "459992",
//       amount: "402897019057282150357", // 402.89701905728215
//       amountInETH: "13799760000000000",
//     },
//   },
//   {
//     payer: "0x9042f6b859329F414bF4CB09e719AD6012B05Bd9",
//     amount: "189295697872308378444",
//     amountInETH: "6483630000000000",
//   },
// ];
