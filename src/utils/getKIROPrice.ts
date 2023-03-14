import { ethers } from "ethers";

import { addresses } from "../batchMultiSigCall";
import { multicallContracts } from "../constants";
import { Interface } from "../helpers/Interfaces";

const data = {
  5: {
    V2_Pool: "0x0D415c2496099DfBE817fc5A0285bE3d86b9FD8d",
    isToken0KIRO: true,
  },
};
function decode144(val: bigint) {
  const RESOLUTION = BigInt(112);
  return val >> RESOLUTION;
}

const getMulticallContract = (
  chainId: number,
  provider: ethers.providers.JsonRpcProvider | ethers.providers.Web3Provider
) => {
  const multicallAddress = multicallContracts[chainId as keyof typeof multicallContracts];
  if (!multicallAddress) {
    throw new Error(`No multicall address found for chainId ${chainId}`);
  }
  return new ethers.Contract(
    multicallAddress,
    [
      "function aggregate((address target, bytes callData)[] calls) external view returns (uint256 blockNumber, bytes[] returnData)",
    ],
    provider
  );
};

const getData = async ({
  chainId,
  provider,
}: {
  chainId: number;
  provider: ethers.providers.JsonRpcProvider | ethers.providers.Web3Provider;
}) => {
  const poolAddress = data[chainId as keyof typeof data].V2_Pool;
  const actuatorAddress = addresses[chainId as keyof typeof addresses].Actuator;
  if (!poolAddress) {
    throw new Error(`No pool address found for chainId ${chainId}`);
  }
  const UniswapV2Pair = new ethers.utils.Interface([
    "function getReserves() view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)",
    "function price0CumulativeLast() external view returns (uint)",
    "function price1CumulativeLast() external view returns (uint)",
  ]);
  const Actuator = Interface.FCT_Actuator;

  const multicallContract = getMulticallContract(chainId, provider);

  const [blockNumber, returnData] = await multicallContract.callStatic.aggregate([
    {
      target: poolAddress,
      callData: UniswapV2Pair.encodeFunctionData("price0CumulativeLast"),
    },
    {
      target: poolAddress,
      callData: UniswapV2Pair.encodeFunctionData("price1CumulativeLast"),
    },
    {
      target: poolAddress,
      callData: UniswapV2Pair.encodeFunctionData("getReserves"),
    },
    {
      target: actuatorAddress,
      callData: Actuator.encodeFunctionData("s_blockTimestampLast"),
    },
    {
      target: actuatorAddress,
      callData: Actuator.encodeFunctionData("s_price0CumulativeLast"),
    },
    {
      target: actuatorAddress,
      callData: Actuator.encodeFunctionData("s_price1CumulativeLast"),
    },
    {
      target: actuatorAddress,
      callData: Actuator.encodeFunctionData("s_timeBetweenKiroPriceUpdate"),
    },
    {
      target: actuatorAddress,
      callData: Actuator.encodeFunctionData("s_price0Average"),
    },
    {
      target: actuatorAddress,
      callData: Actuator.encodeFunctionData("s_price1Average"),
    },
  ]);

  // Decode return data
  const [
    price0CumulativeLast,
    price1CumulativeLast,
    getReserves,
    s_blockTimestampLast,
    s_price0CumulativeLast,
    s_price1CumulativeLast,
    s_timeBetweenKiroPriceUpdate,
    s_price0Average,
    s_price1Average,
  ] = (returnData as any[]).map((data, i: number) => {
    if (i === 2) {
      return UniswapV2Pair.decodeFunctionResult("getReserves", data);
    }
    return ethers.BigNumber.from(data);
  });

  return {
    blockNumber,
    price0CumulativeLast,
    price1CumulativeLast,
    getReserves,
    s_blockTimestampLast,
    s_price0CumulativeLast,
    s_price1CumulativeLast,
    s_timeBetweenKiroPriceUpdate,
    s_price0Average,
    s_price1Average,
  };
};

const getCumulativePrices = ({
  blockTimestamp,
  getReserves,
  price0CumulativeLast,
  price1CumulativeLast,
}: {
  blockTimestamp: number;
  getReserves: ethers.utils.Result;
  price0CumulativeLast: ethers.BigNumber;
  price1CumulativeLast: ethers.BigNumber;
}) => {
  const { reserve0, reserve1, blockTimestampLast } = getReserves;
  function fraction(num: string, denom: string) {
    const numerator = BigInt(num);
    const denominator = BigInt(denom);
    const RESOLUTION = BigInt(112);
    const Q112 = BigInt(2 ** 112);

    if (numerator <= 2 ** 144 - 1) {
      const result = (numerator * BigInt(2) ** RESOLUTION) / denominator;
      if (result > 2 ** 224 - 1) throw Error("FixedPoint::fraction: overflow");
      return result;
    } else {
      const result = (numerator * Q112) / denominator;
      if (result > 2 ** 224 - 1) throw Error("FixedPoint::fraction: overflow");
      return result;
    }
  }

  const timeElapsed = blockTimestamp - blockTimestampLast;

  const price0Cumulative =
    fraction(reserve1.toString(), reserve0.toString()) * BigInt(timeElapsed) + BigInt(price0CumulativeLast.toString());
  const price1Cumulative =
    fraction(reserve0.toString(), reserve1.toString()) * BigInt(timeElapsed) + BigInt(price1CumulativeLast.toString());
  return {
    price0Cumulative,
    price1Cumulative,
  };
};

export const getKIROPrice = async ({
  chainId,
  rpcUrl,
  provider,
  blockTimestamp,
}: {
  chainId: number;
  rpcUrl?: string;
  provider?: ethers.providers.JsonRpcProvider | ethers.providers.Web3Provider;
  blockTimestamp?: number;
}) => {
  if (!provider) {
    if (!rpcUrl) {
      throw new Error("Must provide either a provider or an rpcUrl");
    }
    provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  }
  blockTimestamp = (blockTimestamp || (await provider.getBlock("latest")).timestamp) as number;
  const isToken0KIRO = data[chainId as keyof typeof data].isToken0KIRO;
  const {
    price0CumulativeLast,
    price1CumulativeLast,
    getReserves,
    s_blockTimestampLast,
    s_price0CumulativeLast,
    s_price1CumulativeLast,
    s_timeBetweenKiroPriceUpdate,
    s_price0Average,
    s_price1Average,
  } = await getData({ chainId, provider });

  const { price0Cumulative, price1Cumulative } = getCumulativePrices({
    blockTimestamp,
    getReserves: getReserves as ethers.utils.Result,
    price0CumulativeLast: price0CumulativeLast as ethers.BigNumber,
    price1CumulativeLast: price1CumulativeLast as ethers.BigNumber,
  });

  const timeElapsed = blockTimestamp - s_blockTimestampLast.toNumber();

  // If time elapsed is less than the time between KIRO price updates, we don't need to update the price
  if (timeElapsed < s_timeBetweenKiroPriceUpdate.toNumber()) {
    const priceAverage = isToken0KIRO ? s_price0Average : s_price1Average;

    return decode144(BigInt(priceAverage.toString()) * BigInt(1e18)).toString();
  }
  const price0Average = (price0Cumulative - BigInt(s_price0CumulativeLast.toString())) / BigInt(timeElapsed);
  const price1Average = (price1Cumulative - BigInt(s_price1CumulativeLast.toString())) / BigInt(timeElapsed);

  const priceAverage = isToken0KIRO ? price0Average : price1Average;

  return decode144(priceAverage * BigInt(1e18)).toString();
};
