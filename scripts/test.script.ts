// // Init dotenv
import * as dotenv from "dotenv";

import { AaveV2, BatchMultiSigCall, ethers } from "../src";

dotenv.config();

async function main() {
  const chainId = "1";
  const FCT = new BatchMultiSigCall();

  const aaveDeposit = new AaveV2.actions.Deposit({
    chainId,
    initParams: {
      methodParams: {
        amount: "1",
        onBehalfOf: "0x9650578ebd1b08f98af81a84372ece4b448d7526",
        asset: "0x6b175474e89094c44da98b954eedeac495271d0f",
      },
    },
  });

  const callDefault = FCT.setCallDefaults({
    from: ethers.Wallet.createRandom().address,
  });

  console.log(callDefault);

  console.log(FCT.callDefault);

  const call = await FCT.add({
    plugin: aaveDeposit,
  });

  console.log(call.get().from);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
