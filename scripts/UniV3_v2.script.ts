import { SupportedChainId, Token } from "@uniswap/sdk-core";
import IUniswapV3PoolABI from "@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json";
import { nearestUsableTick, Pool, Position } from "@uniswap/v3-sdk";
import Decimal from "decimal.js";
import * as dotenv from "dotenv";
import { ethers } from "ethers";

import data from "./scriptData";
// import util from "util";

// sqrtPriceX96 = sqrt(price) * q96
// sqrt(price) = sqrtPriceX96 / q96
// price = sqrtPriceX96 / q96 ** 2
// sqrt(1.0001)^tick = sqrtPriceX96 / q96

dotenv.config();

const q96 = 2n ** 96n;

const WETH = new Token(
  SupportedChainId.MAINNET,
  "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  18,
  "WETH",
  "Wrapped Ether"
);
const USDC = new Token(SupportedChainId.MAINNET, "0x2f3A40A3db8a7e3D09B0adfEfbCe4f6F81927557", 6, "USDC", "USD Coin");

async function main() {
  // const sqrtPriceX96pool = 1997558511221073801267685416255924n;
  // const liquidity = 26515644603041494425n;
  // const tick = 202712;
  // const tickSpacing = 10;
  const fee = 500;

  const poolContract = new ethers.Contract(
    "0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640",
    IUniswapV3PoolABI.abi,
    new ethers.providers.JsonRpcProvider(data[1].rpcUrl)
  );

  const [tickSpacing, liquidity, slot0] = await Promise.all([
    poolContract.tickSpacing(),
    poolContract.liquidity(),
    poolContract.slot0(),
  ]);

  const sqrtPriceX96pool = slot0.sqrtPriceX96;
  const tick = slot0.tick;

  // Create a function that converts price to the closest tick
  const priceToTick = (price: number, decimal: number) => {
    const value = Math.floor(Math.log(price / 10 ** decimal) / Math.log(1.0001));
    return value > 0 ? value : -value;
  };

  const priceToTickV2 = (price: number, decimalDiff: number, token0PriceOfToken1: boolean) => {
    const p = token0PriceOfToken1 ? price : 1 / price;
    return Math.floor(Math.log(p * 10 ** decimalDiff) / Math.log(1.0001));
  };

  const priceToTickString = (price: number, decimal: number) => {
    const value = new Decimal(price)
      .div(10 ** decimal)
      .log(1.0001)
      .floor();
    return value.isPos() ? value.toString() : value.neg().toString();
  };

  console.log(priceToTick(1500, 12));
  console.log(priceToTickString(1500, 12));

  const pool = new Pool(USDC, WETH, fee, sqrtPriceX96pool.toString(), liquidity.toString(), tick);

  console.log(pool.token0Price.toFixed());
  console.log(pool.token1Price.toFixed());

  // Price to closest tick with Uniswap

  console.log(
    nearestUsableTick(priceToTick(1499.7, 12), tickSpacing),
    nearestUsableTick(priceToTick(1600.4, 12), tickSpacing)
  );

  const position = Position.fromAmount0({
    pool,
    tickUpper: nearestUsableTick(priceToTick(1499.7, 12), tickSpacing),
    tickLower: nearestUsableTick(priceToTick(1600.4, 12), tickSpacing),
    amount0: "100" + "0".repeat(6),
    useFullPrecision: true,
  });

  console.log({
    amount0: position.amount0.quotient.toString(),
    amount1: position.amount1.quotient.toString(),
    liquidity: position.liquidity.toString(),
    tickLower: position.tickLower,
    tickUpper: position.tickUpper,
  });

  // console.log(priceToTick(0.0006667222649076464, 12));
  console.log(priceToTickV2(0.0006667222649076464, 12, true));
  console.log(priceToTickV2(1499.8749143896055, 12, false));
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
