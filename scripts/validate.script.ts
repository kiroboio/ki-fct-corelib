import FCTData from "../FCT.json";
import { BatchMultiSigCall, ethers } from "../src";
// import scriptData from "./scriptData";
const chainId = 5;

// FCTE_Activated - 0x3d67d7b0242c56cec690a3513b11ac7c54835ff09550d772f7f354269829c669
// FCTE_CallPayment - 0x57a285d11c52114e1c932af91ce610073cb95f99c6126bf75c6a59b3846e0d6a

async function main() {
  const FCT = BatchMultiSigCall.from(FCTData);

  // Actual payment in KIRO 0x32b6f81c6718c80732, 935521522823727679282n
  // 0x32b6f81c6718c80732
  // 0x2126c4a765273d6840 base - 611536096154183624768
  // 0x1190337501f18a9ef2 fee - 323985426669544054514

  // 0x2ffeb commonGas - 196587
  const payments = FCT.utils.getPaymentPerPayer({
    signatures: FCTData.signatures,
    kiroPriceInETH: "29174339261661309654809",
    gasPrice: ethers.utils.parseUnits("55.43989903", "gwei").toNumber(),
  });

  console.log("Base FROM TX", 611536096154183624768n);
  console.log("Fee FROM TX ", 323985426669544054514n);

  console.log("PAYMENT FROM CALCULATION", payments[0].amount);
  console.log("ACTUAL PAYMENT          ", 935521522823727679282n);
}

main()
  .then(() => {
    console.log("Done!");
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
