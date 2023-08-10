import { AaveV2 } from "@kiroboio/fct-plugins";
import { ethers } from "ethers";

import { BatchMultiSigCall } from "../src";

const createRandomAddress = () => ethers.Wallet.createRandom().address;

async function main() {
  const FCT = new BatchMultiSigCall();

  const from = createRandomAddress();

  await FCT.add({
    from,
    plugin: new AaveV2.actions.Deposit({
      chainId: "5",
      initParams: {
        methodParams: {
          asset: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
          amount: "1000000000000000000",
          onBehalfOf: from,
        },
      },
    }),
  });

  const withApprovals = await FCT.exportWithApprovals();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
