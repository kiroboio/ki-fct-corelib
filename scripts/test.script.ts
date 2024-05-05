// // Init dotenv
import * as dotenv from "dotenv";

import { BatchMultiSigCall, ERC20, ethers } from "../src";
import { scriptData } from "./scriptData";

dotenv.config();

const randAddr = () => ethers.Wallet.createRandom().address;

const ChainID = "1";

async function main() {
  const FCT = new BatchMultiSigCall({
    chainId: ChainID,
  });

  const Transfer = new ERC20.actions.Transfer({
    chainId: "1",
    initParams: {
      to: scriptData[ChainID].USDC,
      methodParams: {
        amount: "123",
        recipient: randAddr(),
      },
    },
  });

  const Balance = new ERC20.getters.BalanceOf({
    chainId: "1",
    initParams: {
      to: scriptData[ChainID].USDC,
      methodParams: {
        owner: randAddr(),
      },
    },
  });

  for (let i = 0; i < 30; i++) {
    await FCT.add({
      from: "0x8c9b261faef3b3c2e64ab5e58e04615f8c788099",
      plugin: Transfer,
    });

    await FCT.add({
      from: "0x8c9b261faef3b3c2e64ab5e58e04615f8c788099",
      plugin: Balance,
    });
  }
  const messageHash = FCT.utils.getMessageHash();
  console.log("messageHash", messageHash);
  const exported = FCT.export();

  for (let i = 0; i < 10; i++) {
    console.time("from");
    const FCT2 = BatchMultiSigCall.from(exported, messageHash);
    console.timeEnd("from");

    console.time("isValid");
    FCT2.utils.isValid();
    console.timeEnd("isValid");

    console.time("recoverAddress");
    FCT2.utils.recoverAddress(exported.signatures[0]);
    console.timeEnd("recoverAddress");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
