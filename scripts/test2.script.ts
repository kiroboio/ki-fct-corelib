import { UniswapSwapPlugin } from "@kiroboio/fct-plugins";
import { ethers } from "ethers";

import { BatchMultiSigCall } from "../src";
import scriptData from "./scriptData";

type ExtractPropsFromArray<T> = Omit<T, keyof Array<unknown> | `${number}`>;

const createRandomAddress = () => ethers.Wallet.createRandom().address;

async function main() {
  const FCT = new BatchMultiSigCall({ chainId: "1" });
  const Swap = new UniswapSwapPlugin({
    chainId: "1",
    input: {
      from: {
        address: ethers.constants.AddressZero,
        // address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        decimals: 18,
      },
      to: {
        address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        decimals: 6,
      },
      amount: "100" + "0".repeat(6),
      slippage: "100",
      swapType: "exactOut",
      recipient: createRandomAddress(),
    },
    provider: new ethers.providers.JsonRpcProvider(scriptData[1].rpcUrl),
  });

  console.log(Swap.functions.swapExactTokensForTokens);

  const routeData = await Swap.create();
  if (!routeData) throw new Error("Failed to generate client side quote");

  console.log(JSON.stringify(routeData, null, 2));

  await FCT.add({
    from: createRandomAddress(),
    plugin: Swap as any,
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
