import { ChainId, ERC20 } from "@kirobo/ki-eth-fct-provider-ts";
import { ethers } from "ethers";

import { BatchMultiSigCall } from "../batchMultiSigCall";
import BaseTestFCT from "./FCT.json";

const USDC = {
  1: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
  5: "0x07865c6E87B9F70255377e024ace6630C1Eaa37F",
};

export const TestFCT = BaseTestFCT;

export const buildTestFCT = () => {
  const FCT = BatchMultiSigCall.from(TestFCT);

  return { FCT, FCTJson: TestFCT };
};

export const freshTestFCT = async ({ chainId }: { chainId: ChainId }) => {
  const FCT = new BatchMultiSigCall({
    chainId,
  });

  // Create ERC20 Transfer
  const transfer = new ERC20.actions.Transfer({
    chainId,
    initParams: {
      to: USDC[chainId],
      methodParams: {
        amount: ethers.utils.parseUnits("1", 6).toString(),
        recipient: "0x62e3A53A947D34C4DdCD67B49fAdc30b643e2586",
      },
    },
  });

  return { FCT, FCTJson: TestFCT };
};
