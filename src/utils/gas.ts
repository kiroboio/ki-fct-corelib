import { ethers } from "ethers";

import { EIP1559GasPrice } from "../types";

const percentilesForNetworks = {
  1: [2, 6, 12, 25],
  42161: [2, 5, 15, 25],
  10: [2, 5, 15, 25],
  8453: [2, 5, 15, 25],
  // Testnets
  11155111: [2, 10, 50, 80],
  421613: [2, 6, 15, 30],
};

interface GetGasPricesRes {
  baseFee: string;
  slow: EIP1559GasPrice;
  average: EIP1559GasPrice;
  fast: EIP1559GasPrice;
  fastest: EIP1559GasPrice;
}

export const getGasPrices = async ({
  rpcUrl,
  chainId,
  historicalBlocks = 10,
  tries = 40,
  futureBlocks = 0,
}: {
  rpcUrl: string;
  chainId: number;
  historicalBlocks?: number;
  tries?: number;
  futureBlocks?: number;
}): Promise<GetGasPricesRes> => {
  do {
    try {
      const { result, baseFee } = await getFeeHistory({ rpcUrl, chainId, historicalBlocks });

      if (!result) {
        throw new Error("No result");
      }

      const blocks = buildBlocks({
        historicalBlocks,
        feeHistoryResult: result,
        oldestBlock: parseInt(result.oldestBlock, 16),
      });

      return getGasPriceResult({ baseFee, chainId, averages: getAverages(blocks), futureBlocks });
    } catch (err) {
      if (tries > 0) {
        // Wait 3 seconds before retrying
        await new Promise((resolve) => setTimeout(resolve, 3000));
      } else {
        throw new Error("Could not get gas prices, issue might be related to node provider");
      }
    }
  } while (tries-- > 0);
  throw new Error("Could not get gas prices, issue might be related to node provider");
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

async function getFeeHistory({
  rpcUrl,
  chainId,
  historicalBlocks,
}: {
  rpcUrl: string;
  chainId: number;
  historicalBlocks: number;
}) {
  const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  const latestBlock = await provider.getBlock("latest");
  if (!latestBlock.baseFeePerGas) {
    throw new Error("No baseFeePerGas");
  }
  const baseFee = latestBlock.baseFeePerGas.toString();
  const blockNumber = latestBlock.number;

  const data = await fetchFeeHistory({ historicalBlocks, blockNumber, chainId, rpcUrl });

  return {
    result: data.result as
      | { oldestBlock: string; baseFeePerGas: string[]; gasUsedRatio: number[]; reward?: string[][] }
      | undefined,
    baseFee,
  };
}

async function fetchFeeHistory({
  historicalBlocks,
  blockNumber,
  chainId,
  rpcUrl,
}: {
  historicalBlocks: number;
  blockNumber: number;
  chainId: number;
  rpcUrl: string;
}) {
  const res = await fetch(rpcUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "eth_feeHistory",
      params: [
        historicalBlocks,
        `0x${blockNumber.toString(16)}`,
        percentilesForNetworks[chainId as keyof typeof percentilesForNetworks] || percentilesForNetworks[1],
      ],
      id: 1,
    }),
  });
  return (await res.json()) as { result: unknown };
}

function buildBlocks({
  historicalBlocks,
  feeHistoryResult,
  oldestBlock,
}: {
  historicalBlocks: number;
  feeHistoryResult: { oldestBlock: string; baseFeePerGas: string[]; gasUsedRatio: number[]; reward?: string[][] };
  oldestBlock: number;
}) {
  let blockNum = oldestBlock;
  return Array.from({ length: historicalBlocks - 1 }, (_, i) => {
    const number = blockNum;
    blockNum += 1;
    return {
      number,
      baseFeePerGas: feeHistoryResult.baseFeePerGas[i],
      gasUsedRatio: feeHistoryResult.gasUsedRatio[i],
      priorityFeePerGas: feeHistoryResult.reward ? feeHistoryResult.reward[i] : [],
    };
  });
}

function getAverages(blocks: any[]) {
  return {
    slow: avg(blocks.map((b) => b.priorityFeePerGas[0])),
    average: avg(blocks.map((b) => b.priorityFeePerGas[1])),
    fast: avg(blocks.map((b) => b.priorityFeePerGas[2])),
    fastest: avg(blocks.map((b) => b.priorityFeePerGas[3])),
  };
}

function getGasPriceResult({
  baseFee,
  chainId,
  averages,
  futureBlocks,
}: {
  baseFee: string;
  chainId: number;
  averages: ReturnType<typeof getAverages>;
  futureBlocks: number;
}) {
  const { slow, average, fast, fastest } = averages;

  // On Arbitrum use the baseFee as is, otherwise calculate the baseFee for 2 blocks in the future
  const baseFeePerGas = chainId === 42161 ? BigInt(baseFee) : getMaxBaseFeeInFutureBlock(BigInt(baseFee), futureBlocks);

  return {
    baseFee: baseFee,
    slow: gasPriceCalculation({ priorityFee: slow, baseFee: baseFeePerGas }),
    average: gasPriceCalculation({ priorityFee: average, baseFee: baseFeePerGas }),
    fast: gasPriceCalculation({ priorityFee: fast, baseFee: baseFeePerGas }),
    fastest: gasPriceCalculation({ priorityFee: fastest, baseFee: baseFeePerGas }),
  };
}

function gasPriceCalculation({ priorityFee, baseFee }: { priorityFee: bigint; baseFee: bigint }) {
  return {
    maxFeePerGas: (baseFee + priorityFee).toString(),
    maxPriorityFeePerGas: priorityFee.toString(),
  };
}
