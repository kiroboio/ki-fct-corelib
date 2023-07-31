import { CompoundV3 } from "@kiroboio/fct-plugins";
import { ethers } from "ethers";
import util from "util";

import { BatchMultiSigCall } from "../src";

const createRandomAddress = () => ethers.Wallet.createRandom().address;

async function main() {
  const FCT = new BatchMultiSigCall();

  await FCT.add({
    from: createRandomAddress(),
    plugin: new CompoundV3.actions.Supply({
      chainId: "5",
      initParams: {
        methodParams: {
          amount: "1000000000000000000",
          asset: "0x6c8c6b02e7b2be14d4fa6022dfd6d75921d90e4e",
        },
      },
    }),
  });

  const data = await FCT.exportFCTWithApprovals();

  console.log(util.inspect(data, false, null, true /* enable colors */));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
