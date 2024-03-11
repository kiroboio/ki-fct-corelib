// // Init dotenv
import * as dotenv from "dotenv";

import { BatchMultiSigCall, ethers, Magic } from "../src";

dotenv.config();

const randAddr = () => ethers.Wallet.createRandom().address;

async function main() {
  const FCT = new BatchMultiSigCall({
    chainId: "5",
  });

  const from = randAddr();

  console.log(from);

  await FCT.add({
    from,
    method: "transfer",
    to: randAddr(),
    value: "0",
  });

  await FCT.add({
    from: "0x4FEe9fc300DFF6221e5911f296c4CaA3d23A7830",
    plugin: new Magic.actions.Magic({
      chainId: "5",
    }),
    options: {
      payerIndex: 0,
    },
  });

  const signers = FCT.utils.getSigners();

  console.log(signers);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
