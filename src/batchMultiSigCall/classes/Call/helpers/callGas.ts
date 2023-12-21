import { ChainId } from "@kiroboio/fct-plugins";

// Static call overhead first - 34893
// Static call overhead (NOTFIRST) - 8 393

// Delegate call first - 43 622
// Delegate call overhead (NOTFIRST) - 17 122
// If there was already delegate call, other delegate call overhead - 10 622

// Call overhead with ETH (FIRST) - 41396
// Call overhead (NOTFIRST) - 8393
// Cost of ETH in the call - 6503

const gasCosts = {
  call_firstOverhead: 35000n,
  call_otherOverhead: 8400n,
  delegateCall_firstOverhead: 44000n,
  delegateCall_otherOverhead: 17200n,
  delegateCall_repeatOverhead: 10800n,
  nativeTokenOverhead: 6550n,
} as const;

export const getGasCosts = (key: keyof typeof gasCosts, chainId: ChainId) => {
  const gas = gasCosts[key];
  if (chainId === "42161" || chainId === "421613") {
    // Arbitrum x13
    return gas * 13n;
  }
  return gas;
};
