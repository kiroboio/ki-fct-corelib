import { ChainId, ERC20, TokensMath } from "@kiroboio/fct-plugins";

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

export const freshTestFCT = ({ chainId }: { chainId: ChainId }) => {
  const vault = "0x03357338Ea477FF139170cf85C9A4063dFc03FC9";
  const FCT = new BatchMultiSigCall({
    chainId,
    defaults: {
      from: vault,
    },
  });

  const defaultSettings = {
    validFrom: "0",
    expiresAt: "2680505792",
  };

  FCT.setOptions(defaultSettings);

  const balanceOf = new ERC20.getters.BalanceOf({
    chainId,
    initParams: {
      to: USDC[chainId],
      methodParams: {
        owner: vault,
      },
    },
  });

  const halfOfBalance = new TokensMath.getters.Divide({
    chainId,
    initParams: {
      methodParams: {
        amount1: balanceOf.output.params.balance.getOutputVariable("usdc_balanceOf"),
        amount2: "2",
        decimals1: "0",
        decimals2: "0",
        decimalsOut: "0",
      },
    },
  });

  const transfer = new ERC20.actions.Transfer({
    chainId,
    initParams: {
      to: USDC[chainId],
      methodParams: {
        amount: halfOfBalance.output.params.result.getOutputVariable("usdc_halfOfBalance"),
        recipient: "0x62e3A53A947D34C4DdCD67B49fAdc30b643e2586",
      },
    },
  });

  FCT.createMultiple([
    {
      plugin: balanceOf,
      nodeId: "usdc_balanceOf",
    },
    {
      plugin: halfOfBalance,
      nodeId: "usdc_halfOfBalance",
    },
    {
      plugin: transfer,
      nodeId: "usdc_transfer",
    },
  ]);

  return FCT;
};
