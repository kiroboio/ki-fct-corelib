import { ethers } from "ethers";

import { EIP1559GasPrice } from "../types";

const precentilesForNetworks = {
  5: [2, 6, 15, 30],
  1: [2, 5, 15, 25],
};

const gasPriceCalculationsByChains = {
  5: (maxFeePerGas: bigint) => {
    // If maxFeePerGas < 70 gwei, add 15% to maxFeePerGas

    if (maxFeePerGas < 70_000_000_000n) {
      return (maxFeePerGas + (maxFeePerGas * 15n) / 100n).toString();
    }
    // If maxFeePerGas < 100 gwei, add 10% to maxFeePerGas
    if (maxFeePerGas < 100_000_000_000) {
      return (maxFeePerGas + (maxFeePerGas * 10n) / 100n).toString();
    }
    // If maxFeePerGas > 200 gwei, add 5% to maxFeePerGas
    if (maxFeePerGas > 200_000_000_000) {
      return (maxFeePerGas + (maxFeePerGas * 5n) / 100n).toString();
    }
    return maxFeePerGas.toString();
  },
  1: (maxFeePerGas: bigint) => maxFeePerGas.toString(),
};
function avg(arr: string[]) {
  const sum = arr.reduce((a, v) => BigInt(a) + BigInt(v), 0n);
  return sum / BigInt(arr.length);
}

export const getGasPrices = async ({
  rpcUrl,
  chainId,
  historicalBlocks = 10,
  tries = 40,
}: {
  rpcUrl: string;
  chainId: number;
  historicalBlocks?: number;
  tries?: number;
}): Promise<Record<"slow" | "average" | "fast" | "fastest", EIP1559GasPrice>> => {
  const provider = new ethers.providers.JsonRpcProvider(rpcUrl);

  let keepTrying = true;
  let returnValue: Record<"slow" | "average" | "fast" | "fastest", EIP1559GasPrice>;

  do {
    try {
      const latestBlock = await provider.getBlock("latest");
      if (!latestBlock.baseFeePerGas) {
        throw new Error("No baseFeePerGas");
      }
      const baseFee = latestBlock.baseFeePerGas.toString();
      const blockNumber = latestBlock.number;

      const generateBody = () => {
        return JSON.stringify({
          jsonrpc: "2.0",
          method: "eth_feeHistory",
          params: [
            historicalBlocks,
            `0x${blockNumber.toString(16)}`,
            precentilesForNetworks[chainId as keyof typeof precentilesForNetworks] || precentilesForNetworks[5],
          ],
          id: 1,
        });
      };

      const res = await fetch(rpcUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: generateBody(),
      });
      const data = await res.json();
      const result = data.result;

      if (!result) {
        throw new Error("No result");
      }

      let blockNum = parseInt(result.oldestBlock, 16);
      let index = 0;
      const blocks: {
        number: number;
        baseFeePerGas: string;
        gasUsedRatio: string;
        priorityFeePerGas: string[];
      }[] = [];

      while (blockNum < parseInt(result.oldestBlock, 16) + historicalBlocks) {
        blocks.push({
          number: blockNum,
          baseFeePerGas: result.baseFeePerGas[index],
          gasUsedRatio: result.gasUsedRatio[index],
          priorityFeePerGas: result.reward[index],
        });
        blockNum += 1;
        index += 1;
      }

      const slow = avg(blocks.map((b) => b.priorityFeePerGas[0]));
      const average = avg(blocks.map((b) => b.priorityFeePerGas[1]));
      // Add 5% to fast and fastest
      const fast = avg(blocks.map((b) => b.priorityFeePerGas[2]));
      const fastest = avg(blocks.map((b) => b.priorityFeePerGas[3]));
      const baseFeePerGas = BigInt(baseFee);

      const gasPriceCalc =
        gasPriceCalculationsByChains[chainId as keyof typeof gasPriceCalculationsByChains] ||
        gasPriceCalculationsByChains[1];

      returnValue = {
        slow: {
          maxFeePerGas: (slow + baseFeePerGas).toString(),
          maxPriorityFeePerGas: slow.toString(),
        },
        average: {
          maxFeePerGas: (average + baseFeePerGas).toString(),
          maxPriorityFeePerGas: average.toString(),
        },
        fast: {
          maxFeePerGas: gasPriceCalc(fast + baseFeePerGas),
          maxPriorityFeePerGas: fast.toString(),
        },
        fastest: {
          maxFeePerGas: gasPriceCalc(fastest + baseFeePerGas),
          maxPriorityFeePerGas: fastest.toString(),
        },
      };

      keepTrying = false;

      return returnValue;
    } catch (err) {
      if (tries > 0) {
        // Wait 3 seconds before retrying
        await new Promise((resolve) => setTimeout(resolve, 3000));
      } else {
        throw new Error("Could not get gas prices, issue might be related to node provider");
      }
    }
  } while (keepTrying && tries-- > 0);
  throw new Error("Could not get gas prices, issue might be related to node provider");
};
