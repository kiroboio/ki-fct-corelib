// Init dotenv
import * as dotenv from "dotenv";

import { AaveV2, BatchMultiSigCall, ERC20, ethers } from "../src";
import { Flow } from "../src/constants";

dotenv.config();

const activator = "0x4c508dc4a3aacbecbf13c1d543b4936274033110";
const receiver = ethers.Wallet.createRandom().address;

async function main() {
  const FCT = new BatchMultiSigCall({
    chainId: "1",
  });

  const transfer = new ERC20.actions.SimpleTransfer({
    vaultAddress: activator,
    chainId: "1",
  });

  transfer.input.set({
    to: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    methodParams: {
      from: activator,
      amount: "100" + "0".repeat(6),
      to: receiver,
    },
  });

  const deposit = new AaveV2.actions.Deposit({
    chainId: "1",
    vaultAddress: activator,
  });

  deposit.input.set({
    methodParams: {
      amount: "100" + "0".repeat(6),
      asset: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      onBehalfOf: activator,
    },
  });

  await FCT.addMultiple([
    {
      plugin: transfer,
      nodeId: "1",
      options: {
        flow: Flow.OK_CONT_FAIL_STOP,
      },
    },
    {
      plugin: transfer,
      nodeId: "2.5",
      options: {
        flow: Flow.OK_CONT_FAIL_STOP,
      },
    },
    {
      plugin: deposit,
      nodeId: "2",
    },
  ]);

  const assetFlow = FCT.utils.getAssetFlow();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
