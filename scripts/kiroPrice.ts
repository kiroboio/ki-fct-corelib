import { ethers } from "ethers";

import scriptData from "./scriptData";
const chainId = 5;
const KIRO_WETH_Pool = "0x0D415c2496099DfBE817fc5A0285bE3d86b9FD8d";

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
    // const result = FullMath.mulDiv(numerator, Q112, denominator);
    const result = (numerator * Q112) / denominator;
    if (result > 2 ** 224 - 1) throw Error("FixedPoint::fraction: overflow");
    return result;
  }
}

function decode144(val: bigint) {
  const RESOLUTION = BigInt(112);
  return val >> RESOLUTION;
}

async function main() {
  const provider = new ethers.providers.JsonRpcProvider(scriptData[chainId].rpcUrl);
  const blockTimestamp = (await provider.getBlock("latest")).timestamp;
  const UniswapV2Pair = new ethers.Contract(
    KIRO_WETH_Pool,
    [
      "function getReserves() view returns (uint112 _reserve0, uint112 _reserve1, uint32 _blockTimestampLast)",
      "function token0() view returns (address)",
      "function price0CumulativeLast() external view returns (uint)",
      "function price1CumulativeLast() external view returns (uint)",
    ],
    provider
  );

  const price0CumulativeLast = await UniswapV2Pair.price0CumulativeLast();
  const price1CumulativeLast = await UniswapV2Pair.price1CumulativeLast();
  const { 0: reserve0, 1: reserve1, 2: blockTimestampLast } = await UniswapV2Pair.getReserves();

  console.log("price0CumulativeLast", price0CumulativeLast.toString());
  console.log("price1CumulativeLast", price1CumulativeLast.toString());

  console.log("reserve0", reserve0.toString());
  console.log("reserve1", reserve1.toString());

  const timeElapsed = BigInt(blockTimestamp) - BigInt(blockTimestampLast.toString());
  //   const price0Cumulative =
  //     fraction(reserve1.toString(), reserve0.toString()) * BigInt(timeElapsed) + BigInt(price0CumulativeLast.toString());
  //   const price1Cumulative =
  //     fraction(reserve0.toString(), reserve1.toString()) * BigInt(timeElapsed) + BigInt(price1CumulativeLast.toString());
  const price0Cumulative =
    (BigInt(reserve1.toString()) / BigInt(reserve0.toString())) * BigInt(timeElapsed) +
    BigInt(price0CumulativeLast.toString());
  const price1Cumulative =
    (BigInt(reserve0.toString()) / BigInt(reserve1.toString())) * BigInt(timeElapsed) +
    BigInt(price1CumulativeLast.toString());

  console.log("timeElapsed", timeElapsed.toString());
  console.log("price0Cumulative", price0Cumulative.toString());
  console.log("price1Cumulative", price1Cumulative.toString());
  console.log("");

  const price0Average = price0Cumulative - BigInt(price0CumulativeLast.toString()) / BigInt(timeElapsed);
  const price1Average = price1Cumulative - BigInt(price1CumulativeLast.toString()) / BigInt(timeElapsed);

  console.log("price0Average", price0Average.toString());
  console.log("price1Average", price1Average.toString());
  console.log("");

  const KIROPriceInETH = price1Average * BigInt(1e18);
  console.log("KIROPriceInETH", KIROPriceInETH.toString());
  console.log("KIROPriceInETH", decode144(KIROPriceInETH).toString());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

// 2515671042171160012110
// 1175658011775855131063
// 513608680452
// 513506057583076393067347023156
