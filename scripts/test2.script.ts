// // Init dotenv
import * as dotenv from "dotenv";

import { BatchMultiSigCall, ethers, Magic } from "../src";

dotenv.config();

const randAddr = () => ethers.Wallet.createRandom().address;

async function main() {
  const FCT = new BatchMultiSigCall({
    chainId: "5",
  });

  await FCT.add({
    from: "0x9297e49dEac4F4AFeEF452D90F21576C3B8A973B",
    plugin: new Magic.actions.Magic({
      chainId: "5",
    }),
    options: {
      payerIndex: 0,
    },
  });

  // Get payment per payer
  const paymentPerPayer = FCT.utils.getPaymentPerPayer({
    ethPriceInKIRO: "1",
  });

  console.log("payment1", paymentPerPayer);

  const exportedFCT = FCT.export();

  // Import it back in and call
  const paymentPerPayer2 = BatchMultiSigCall.from(exportedFCT).utils.getPaymentPerPayer({
    ethPriceInKIRO: "1",
  });

  console.log("payment2", paymentPerPayer2);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
