import { ERC20 } from "@kiroboio/flow-plugins";
import { ethers } from "ethers";

import { BatchMultiSigCall } from "../src";

const createRandomAddress = () => ethers.Wallet.createRandom().address;

async function main() {
  const FCT = new BatchMultiSigCall({ chainId: "1" });

  const Transfer = new ERC20.transfer({ chainId: "1" });
  Transfer.setContractAddress("0x6b175474e89094c44da98b954eedeac495271d0f");
  Transfer.set({
    _to: createRandomAddress(),
    _value: "1000000000000000000",
  });

  await FCT.add({
    from: createRandomAddress(),
    plugin: Transfer as any,
  });

  const FCTData = FCT.export();

  console.log(JSON.stringify(FCTData, null, 2));
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
