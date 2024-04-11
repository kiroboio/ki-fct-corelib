import { ethers } from "ethers";

import { EIP1559GasPrice } from "../types";

const percentilesForNetworks = {
  1: [5, 8, 15, 25],
  42161: [2, 5, 15, 25],
  10: [2, 5, 15, 25],
  //
  // Testnets
  11155111: [2, 10, 50, 80],
  421613: [2, 6, 15, 30],
  // 5: [2, 6, 15, 30],
};

const gasPriceCalculationsByChains = {
  // 5: (maxFeePerGas: bigint) => maxFeePerGas.toString(),
  1: (maxFeePerGas: bigint) => maxFeePerGas.toString(),
};
function avg(arr: string[] | undefined[]) {
  if (arr.every((v) => v === undefined)) {
    return 0n;
  }
  const sum = (arr as string[]).reduce((a, v) => BigInt(a) + BigInt(v), 0n);
  return sum / BigInt(arr.length);
}

function getMaxBaseFeeInFutureBlock(baseFee: bigint, blocksInFuture: number): bigint {
  let maxBaseFee = baseFee;
  for (let i = 0; i < blocksInFuture; i++) {
    maxBaseFee = (maxBaseFee * 1125n) / 1000n + 1n;
  }
  return maxBaseFee;
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
            percentilesForNetworks[chainId as keyof typeof percentilesForNetworks] || percentilesForNetworks[5],
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
      const data = (await res.json()) as { result: unknown };
      const result = data.result as
        | { oldestBlock: string; baseFeePerGas: string[]; gasUsedRatio: number[]; reward?: string[][] }
        | undefined;

      if (!result) {
        throw new Error("No result");
      }

      let blockNum = parseInt(result.oldestBlock, 16);
      let index = 0;
      const blocks: {
        number: number;
        baseFeePerGas: string;
        gasUsedRatio: number;
        priorityFeePerGas: string[];
      }[] = [];

      while (blockNum < parseInt(result.oldestBlock, 16) + historicalBlocks) {
        blocks.push({
          number: blockNum,
          baseFeePerGas: result.baseFeePerGas[index],
          gasUsedRatio: result.gasUsedRatio[index],
          priorityFeePerGas: result.reward ? result.reward[index] : [],
        });
        blockNum += 1;
        index += 1;
      }

      const slow = avg(blocks.map((b) => b.priorityFeePerGas[0]));
      const average = avg(blocks.map((b) => b.priorityFeePerGas[1]));
      const fast = avg(blocks.map((b) => b.priorityFeePerGas[2]));
      const fastest = avg(blocks.map((b) => b.priorityFeePerGas[3]));
      // const baseFeePerGas = getMaxBaseFeeInFutureBlock(BigInt(baseFee), 2);
      // If chainId is 42161, use the baseFee as is, otherwise calculate the baseFee for 2 blocks in the future
      const baseFeePerGas = chainId === 42161 ? BigInt(baseFee) : getMaxBaseFeeInFutureBlock(BigInt(baseFee), 2);

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
