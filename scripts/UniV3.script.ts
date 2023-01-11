import { SupportedChainId, Token } from "@uniswap/sdk-core";
import BigNumber from "bignumber.js";
import * as dotenv from "dotenv";
// import util from "util";

type Value = string | number | BigNumber;

dotenv.config();

const q96 = 2n ** 96n;
const bgQ96 = new BigNumber(q96.toString());

// function getLiquidity0(x: Value, sa: Value, sb: Value) {
//   x = new BigNumber(x);
//   sa = new BigNumber(sa);
//   sb = new BigNumber(sb);
//   return x.times(sa).times(sb).div(sb.minus(sa)).integerValue(BigNumber.ROUND_FLOOR).toString();
// }

// function getLiquidity1(y: Value, sa: Value, sb: Value) {
//   y = new BigNumber(y);
//   sa = new BigNumber(sa);
//   sb = new BigNumber(sb);
//   return y.div(sb.minus(sa)).integerValue(BigNumber.ROUND_FLOOR).toString();
// }

// function getLiquidity(x: Value, y: Value, sp: Value, sa: Value, sb: Value) {
//   x = new BigNumber(x);
//   y = new BigNumber(y);
//   sp = new BigNumber(sp);
//   sa = new BigNumber(sa);
//   sb = new BigNumber(sb);

//   if (sp.gte(sa)) {
//     return getLiquidity0(x, sa, sb);
//   }
//   if (sp.lt(sb)) {
//     const liq0 = getLiquidity0(x, sp, sb);
//     const liq1 = getLiquidity1(y, sa, sp);
//     return BigNumber.min(liq0, liq1).toString();
//   }
//   return getLiquidity1(y, sa, sb);
// }

// function calculateX(L: Value, sp: Value, sa: Value, sb: Value) {
//   L = new BigNumber(L);
//   sp = new BigNumber(sp);
//   sa = new BigNumber(sa);
//   sb = new BigNumber(sb);
//   sp = BigNumber.max(BigNumber.min(sp, sb), sa);
//   return L.times(sb.minus(sp)).div(sp.times(sb)).toString();
// }

// function calculateY(L: Value, sp: Value, sa: Value, sb: Value) {
//   L = new BigNumber(L);
//   sp = new BigNumber(sp);
//   sa = new BigNumber(sa);
//   sb = new BigNumber(sb);
//   sp = BigNumber.max(BigNumber.min(sp, sb), sa);
//   return L.times(sp.minus(sa)).toString();
// }

function getAmount0(liq: string, pa: string, pb: string) {
  const _liq = new BigNumber(liq);
  let _pa = new BigNumber(pa);
  let _pb = new BigNumber(pb);
  if (_pa.isGreaterThan(_pb)) {
    [_pa, _pb] = [_pb, _pa];
  }
  //   return (liq * q96 * (pb - pa)) / pa / pb;
  // Return it by using BigNumber
  return _liq.times(bgQ96).times(_pb.minus(_pa)).div(_pa).div(_pb).integerValue(BigNumber.ROUND_FLOOR).toString();
}

function getAmount1(liq: string, pa: string, pb: string) {
  const _liq = new BigNumber(liq);
  let _pa = new BigNumber(pa);
  let _pb = new BigNumber(pb);
  if (_pa.isGreaterThan(_pb)) {
    [_pa, _pb] = [_pb, _pa];
  }

  return _liq.times(_pb.minus(_pa)).div(bgQ96).integerValue(BigNumber.ROUND_FLOOR).toString();
}

function getLiquidity0(amount: string, pa: string, pb: string): string {
  const _amount = new BigNumber(amount);
  let _pa = new BigNumber(pa);
  let _pb = new BigNumber(pb);
  if (_pa.isGreaterThan(_pb)) {
    [_pa, _pb] = [_pb, _pa];
  }
  return _amount.times(_pa.times(pb)).div(bgQ96).div(_pb.minus(_pa)).integerValue(BigNumber.ROUND_FLOOR).toString();
}

function getLiquidity1(amount: string, pa: string, pb: string): string {
  const _amount = new BigNumber(amount);
  let _pa = new BigNumber(pa);
  let _pb = new BigNumber(pb);
  if (_pa.isGreaterThan(_pb)) {
    [_pa, _pb] = [_pb, _pa];
  }
  return _amount.times(bgQ96).div(_pb.minus(_pa)).integerValue(BigNumber.ROUND_FLOOR).toString();
}

const priceToTick = (price: number) => {
  return Math.floor(Math.log(price) / Math.log(1.0001));
};

const priceToSqrtp = (p: number) => {
  return BigNumber(p).sqrt().times(q96.toString()).integerValue(BigNumber.ROUND_FLOOR).toFixed();
};

const tickToSqrtPrice = (tick: number) => {
  const val = Math.sqrt(1.0001) ** tick;
  return BigNumber(val).times(q96.toString()).integerValue(BigNumber.ROUND_FLOOR).toFixed();
};

const WETH = new Token(
  SupportedChainId.MAINNET,
  "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  18,
  "WETH",
  "Wrapped Ether"
);
const USDC = new Token(SupportedChainId.MAINNET, "0x2f3A40A3db8a7e3D09B0adfEfbCe4f6F81927557", 6, "USDC", "USD Coin");

// const token0Amount = CurrencyAmount.fromRawAmount(WETH, 1e18);
// const token1Amount = CurrencyAmount.fromRawAmount(USDC, 1e6);

// const configuredPool = new Pool(WETH, USDC, 500, sqrtPriceX96.toString(), liquidity.toString(), tick);

const tickToPrice = (tick: number, token0PerToken1: boolean) => {
  if (token0PerToken1) {
    return 1 / 1.0001 ** tick;
  }
  return 1.0001 ** tick;
};

async function main() {
  const sqrtPriceX96 = 2167946468689374358323659658413970n;
  const liquidity = 39574766804608021174n;
  const tick = 204350;
  const tickSpacing = 10;

  const p = tickToPrice(tick, true) * 1e12;
  const p2 = tickToPrice(tick, false) / 1e12;

  console.log("p", p);
  console.log("p2", p2);

  const addLiquidity = ({
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
    console.log("priceLower", priceLower);
    console.log("priceCurrent", priceCurrent);
    console.log("priceUpper", priceUpper);

    const sqrtPriceX96 = priceToSqrtp(priceCurrent);
    const sqrtPriceAX96 = priceToSqrtp(priceLower);
    const sqrtPriceBX96 = priceToSqrtp(priceUpper);

    // console.log("sqrtPriceX96", sqrtPriceX96, priceToTick(priceCurrent));
    // console.log("sqrtPriceAX96", sqrtPriceAX96, priceToTick(priceLower));
    // console.log("sqrtPriceBX96", sqrtPriceBX96, priceToTick(priceUpper));

    if (tokenA.amount) {
      const liquidity = getLiquidity0(BigInt(tokenA.amount).toString(), sqrtPriceX96, sqrtPriceBX96);
      const amount = getAmount0(liquidity, sqrtPriceBX96, sqrtPriceX96);
      const amount1 = getAmount1(liquidity, sqrtPriceAX96, sqrtPriceX96);

      console.log("amount", BigNumber(amount).shiftedBy(-18).toString());
      console.log("amount1", BigNumber(amount1).shiftedBy(-18).toString());

      return {
        tokenA: {
          ...tokenA,
          amount: BigNumber(tokenA.amount).shiftedBy(-18).toString(),
        },
        tokenB: {
          ...tokenB,
          amount: BigNumber(amount1).shiftedBy(-18).toString(),
        },
      };
    }

    if (tokenB.amount) {
      const liquidity = getLiquidity1(BigInt(tokenB.amount).toString(), sqrtPriceX96, sqrtPriceAX96);
      const amount = getAmount0(liquidity, sqrtPriceBX96, sqrtPriceX96);
      const amount1 = getAmount1(liquidity, sqrtPriceAX96, sqrtPriceX96);

      console.log("amount", BigNumber(amount).shiftedBy(-18).toString());
      console.log("amount1", BigNumber(amount1).shiftedBy(-18).toString());

      return {
        tokenA: {
          ...tokenA,
          amount: BigNumber(amount).shiftedBy(-18).toString(),
        },
        tokenB: {
          ...tokenB,
          amount: BigNumber(tokenB.amount).shiftedBy(-18).toString(),
        },
      };
    }
  };

  const addLiq = addLiquidity({
    tokenA: {
      address: WETH.address,
      decimals: WETH.decimals,
      amount: BigInt(1 * 10 ** 18).toString(),
    },
    tokenB: {
      address: USDC.address,
      decimals: USDC.decimals,
      //   amount: BigInt(801.82 * 10 ** 18).toString(),
    },
    priceLower: 1200,
    // priceLower: 1 / 1200,
    priceCurrent: 1335.25,
    // priceCurrent: 1 / 1335.25,
    priceUpper: 1600.4,
    // priceUpper: 1 / 1600.4,
  });

  console.log(addLiq);

  const priceOfETH = BigNumber(1).div(BigNumber(sqrtPriceX96.toString()).div(q96.toString())).times(1e12);
  console.log(priceOfETH.toString());

  //   const sqrtpLow = priceToSqrtp(1200);
  //   const sqrtpCur = priceToSqrtp(1335.25);
  //   const sqrtpUpp = priceToSqrtp(1600.4);

  //   const liq = liquidity0(BigInt(1 * 10 ** 18).toString(), sqrtpCur, sqrtpUpp);
  //   const liq1 = liquidity1(BigInt(801.82 * 10 ** 18).toString(), sqrtpCur, sqrtpLow);

  //   const amount0 = calc_amount0(liq, sqrtpUpp, sqrtpCur);
  //   const amount1 = calc_amount1(liq, sqrtpLow, sqrtpCur);

  //   const amount0Liq1 = calc_amount0(liq1, sqrtpUpp, sqrtpCur);
  //   const amount1Liq1 = calc_amount1(liq1, sqrtpLow, sqrtpCur);

  //   console.log(
  //     "For 801.82 USDC with these settings Uniswap requires:",
  //     BigNumber(amount0).shiftedBy(-18).toFixed(),
  //     "WETH"
  //   );
  //   console.log("");
  //   console.log(
  //     "For 1 ETH with these settings Uniswap requires:",
  //     BigNumber(amount1Liq1).shiftedBy(-18).toFixed(),
  //     "USDC"
  //   );
  //   console.log("");

  //   // Step by step

  //   // 1. We get price range from the user
  //   // BASE TOKEN = TOKEN0

  //   const p = 1335.25;
  //   const a = 1200;
  //   const b = 1600.4;
  //   const x = 1;
  //   const y = 801.82;

  //   const sp = p ** 0.5;
  //   const sa = a ** 0.5;
  //   const sb = b ** 0.5;

  //   const liqq = getLiquidity0(x, sp, sb);
  //   const ry = calculateY(liqq, sp, sa, sb);

  //   const liqq1 = getLiquidity1(y, sp, sa);
  //   const rx = calculateX(liqq1, sp, sa, sb);

  //   console.log(ry); // 801.82389777955836
  //   console.log(rx); // 1.0000000000000002
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
