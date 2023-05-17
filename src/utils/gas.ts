import { ethers } from "ethers";

import { EIP1559GasPrice } from "../types";

const gasPriceCalculationsByChains = {
  5: (maxFeePerGas: number) => {
    // If maxFeePerGas < 70 gwei, add 15% to maxFeePerGas
    if (maxFeePerGas < 70_000_000_000) {
      return Math.round(maxFeePerGas + maxFeePerGas * 0.15);
    }
    // If maxFeePerGas < 100 gwei, add 10% to maxFeePerGas
    if (maxFeePerGas < 100_000_000_000) {
      return Math.round(maxFeePerGas + maxFeePerGas * 0.1);
      3;
    }
    // If maxFeePerGas > 200 gwei, add 5% to maxFeePerGas
    if (maxFeePerGas > 200_000_000_000) {
      return Math.round(maxFeePerGas + maxFeePerGas * 0.05);
    }
    return maxFeePerGas;
  },
  1: (maxFeePerGas: number) => maxFeePerGas,
};

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
  function avg(arr: number[]) {
    const sum = arr.reduce((a, v) => a + v);
    return Math.round(sum / arr.length);
  }
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
          params: [historicalBlocks, `0x${blockNumber.toString(16)}`, [2, 5, 15, 25]],
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
        baseFeePerGas: number;
        gasUsedRatio: number;
        priorityFeePerGas: number[];
      }[] = [];

      while (blockNum < parseInt(result.oldestBlock, 16) + historicalBlocks) {
        blocks.push({
          number: blockNum,
          baseFeePerGas: Number(result.baseFeePerGas[index]),
          gasUsedRatio: Number(result.gasUsedRatio[index]),
          priorityFeePerGas: result.reward[index].map((x: string) => Number(x)),
        });
        blockNum += 1;
        index += 1;
      }

      const slow = avg(blocks.map((b) => b.priorityFeePerGas[0]));
      const average = avg(blocks.map((b) => b.priorityFeePerGas[1]));
      // Add 5% to fast and fastest
      const fast = avg(blocks.map((b) => b.priorityFeePerGas[2]));
      const fastest = avg(blocks.map((b) => b.priorityFeePerGas[3]));
      const baseFeePerGas = Number(baseFee);

      const gasPriceCalc =
        gasPriceCalculationsByChains[chainId as keyof typeof gasPriceCalculationsByChains] ||
        gasPriceCalculationsByChains[1];

      returnValue = {
        slow: {
          maxFeePerGas: slow + baseFeePerGas,
          maxPriorityFeePerGas: slow,
        },
        average: {
          maxFeePerGas: average + baseFeePerGas,
          maxPriorityFeePerGas: average,
        },
        fast: {
          maxFeePerGas: gasPriceCalc(fast + baseFeePerGas),
          maxPriorityFeePerGas: fast,
        },
        fastest: {
          maxFeePerGas: gasPriceCalc(fastest + baseFeePerGas),
          maxPriorityFeePerGas: fastest,
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
