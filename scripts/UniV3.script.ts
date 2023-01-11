import { SupportedChainId, Token } from "@uniswap/sdk-core";
import { nearestUsableTick } from "@uniswap/v3-sdk";
import BigNumber from "bignumber.js";
import * as dotenv from "dotenv";
// import util from "util";

type Value = string | number | BigNumber;

dotenv.config();

const q96 = 2n ** 96n;
const bgQ96 = new BigNumber(q96.toString());

function getLiquidity0_v2(x: Value, sa: Value, sb: Value) {
  x = new BigNumber(x);
  sa = new BigNumber(sa);
  sb = new BigNumber(sb);
  return x.times(sa).times(sb).div(sb.minus(sa)).integerValue(BigNumber.ROUND_FLOOR).toString();
}

function getLiquidity1_v2(y: Value, sa: Value, sb: Value) {
  y = new BigNumber(y);
  sa = new BigNumber(sa);
  sb = new BigNumber(sb);
  return y.div(sb.minus(sa)).integerValue(BigNumber.ROUND_FLOOR).toString();
}

function getLiquidity(x: Value, y: Value, sp: Value, sa: Value, sb: Value) {
  x = new BigNumber(x);
  y = new BigNumber(y);
  sp = new BigNumber(sp);
  sa = new BigNumber(sa);
  sb = new BigNumber(sb);

  if (sp.gte(sa)) {
    return getLiquidity0_v2(x, sa, sb);
  }
  if (sp.lt(sb)) {
    const liq0 = getLiquidity0_v2(x, sp, sb);
    const liq1 = getLiquidity1_v2(y, sa, sp);
    return BigNumber.min(liq0, liq1).toString();
  }
  return getLiquidity1_v2(y, sa, sb);
}

function calculateX(L: Value, sp: Value, sa: Value, sb: Value) {
  L = new BigNumber(L);
  sp = new BigNumber(sp);
  sa = new BigNumber(sa);
  sb = new BigNumber(sb);
  sp = BigNumber.max(BigNumber.min(sp, sb), sa);
  return L.times(sb.minus(sp)).div(sp.times(sb)).toString();
}

function calculateY(L: Value, sp: Value, sa: Value, sb: Value) {
  L = new BigNumber(L);
  sp = new BigNumber(sp);
  sa = new BigNumber(sa);
  sb = new BigNumber(sb);
  sp = BigNumber.max(BigNumber.min(sp, sb), sa);
  return L.times(sp.minus(sa)).toString();
}

const priceToTick = (price: number) => {
  if (price < 1) {
    return Math.floor(Math.log(1 / price) / Math.log(1.0001));
  }
  return Math.floor(Math.log(price) / Math.log(1.0001));
};

const WETH = new Token(
  SupportedChainId.MAINNET,
  "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  18,
  "WETH",
  "Wrapped Ether"
);
const USDC = new Token(SupportedChainId.MAINNET, "0x2f3A40A3db8a7e3D09B0adfEfbCe4f6F81927557", 6, "USDC", "USD Coin");

async function main() {
  const sqrtPriceX96pool = 2167946468689374358323659658413970n;
  const liquidity = 39574766804608021174n;
  const tick = 204350;
  const tickSpacing = 10;

  const pr = BigNumber(sqrtPriceX96pool.toString()).div(q96.toString()).pow(2).toString();
  const priceOfToken1inToken0 = BigNumber(1).div(pr).toString();
  const priceOfToken0inToken1 = BigNumber(pr).toString();

  console.log("priceOfToken1inToken0", priceOfToken1inToken0, priceToTick(parseFloat(priceOfToken1inToken0)));
  console.log("priceOfToken0inToken1", priceOfToken0inToken1, priceToTick(parseFloat(priceOfToken0inToken1)));

  const addLiquidityV2 = ({
    tokenA,
    tokenB,
    priceLower,
    priceCurrent,
    priceUpper,
  }: {
    tokenA: {
      address: string;
      decimals: number;
      amount?: string;
    };
    tokenB: {
      address: string;
      decimals: number;
      amount?: string;
    };
    priceLower: number;
    priceCurrent: number;
    priceUpper: number;
  }) => {
    const decimalDiff = tokenA.decimals - tokenB.decimals;

    const baseP = priceCurrent;
    const baseA = priceLower;
    const baseB = priceUpper;

    const p = priceCurrent * 10 ** decimalDiff;
    const a = priceLower * 10 ** decimalDiff;
    const b = priceUpper * 10 ** decimalDiff;

    const sp = p ** 0.5;
    const sa = a ** 0.5;
    const sb = b ** 0.5;

    if (tokenA.amount) {
      const amount = new BigNumber(tokenA.amount).shiftedBy(18 - tokenA.decimals).toString();
      const liq0 = getLiquidity0_v2(amount, sp, sb);
      const liq1 = getLiquidity0_v2(amount, sp, sa);
      const liq = BigNumber.max(liq0, liq1).toString();

      const amount1 = BigNumber(liq0).gt(liq1) ? calculateY(liq, sp, sa, sb) : calculateY(liq, sp, sb, sa);

      return {
        tokenA,
        tokenB: {
          ...tokenB,
          amount: BigNumber(amount1)
            .shiftedBy(tokenB.decimals - 18)
            .toFixed(0),
        },
        ticks: {
          tickLower: nearestUsableTick(priceToTick(baseA), 10),
          tickCurrent: nearestUsableTick(priceToTick(baseP), 10),
          tickUpper: nearestUsableTick(priceToTick(baseB), 10),
        },
      };
    }

    if (tokenB.amount) {
      const amount = new BigNumber(tokenB.amount).shiftedBy(18 - tokenB.decimals).toString();
      const liq0 = getLiquidity1_v2(amount, sa, sp);
      const liq1 = getLiquidity1_v2(amount, sb, sp);
      const liq = BigNumber.max(liq0, liq1).toString();
      const amount0 = BigNumber(liq0).gt(liq1) ? calculateX(liq, sp, sa, sb) : calculateX(liq, sp, sb, sa);

      return {
        tokenA: {
          ...tokenA,
          amount: BigNumber(amount0)
            .shiftedBy(tokenA.decimals - 18)
            .toFixed(0),
        },
        tokenB,
        ticks: {
          tickLower: nearestUsableTick(priceToTick(baseA), 10),
          tickCurrent: nearestUsableTick(priceToTick(baseP), 10),
          tickUpper: nearestUsableTick(priceToTick(baseB), 10),
        },
      };
    }
  };

  console.log(
    addLiquidityV2({
      tokenA: {
        address: WETH.address,
        decimals: WETH.decimals,
        amount: BigInt(1 * 10 ** 18).toString(),
      },
      tokenB: {
        address: USDC.address,
        decimals: USDC.decimals,
      },
      priceLower: 1200 / 1e12,
      priceCurrent: 1335.25 / 1e12,
      priceUpper: 1600.4 / 1e12,
    })
  );

  console.log(
    addLiquidityV2({
      tokenA: {
        address: WETH.address,
        decimals: WETH.decimals,
      },
      tokenB: {
        address: USDC.address,
        decimals: USDC.decimals,
        amount: BigInt(802 * 10 ** 6).toString(),
      },
      priceLower: 1200 / 1e12,
      priceCurrent: 1335.25 / 1e12,
      priceUpper: 1600.4 / 1e12,
    })
  );
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
