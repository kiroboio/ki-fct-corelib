import { getPlugin as getPluginProvider, PluginInstance } from "@kirobo/ki-eth-fct-provider-ts";
import { BatchMultiSigCall } from "../batchMultiSigCall";
export declare function getPlugin(this: BatchMultiSigCall, index: number): Promise<PluginInstance>;
export declare function getPluginClass(this: BatchMultiSigCall, index: number): Promise<ReturnType<typeof getPluginProvider>>;
export declare function getPluginData(this: BatchMultiSigCall, index: number): Promise<{
    protocol: "SUSHISWAP" | "UNISWAP" | "VALIDATOR" | "ERC20" | "ERC721" | "ERC1155" | "MATH" | "TOKEN_MATH" | "TOKEN_VALIDATOR" | "AAVE" | "UTILITY" | "PARASWAP" | "YEARN" | "COMPOUND_V2" | "COMPOUND_V3" | "1INCH" | "CURVE" | "CHAINLINK" | "UNISWAP_V3";
    type: "ACTION" | "LIBRARY" | "GETTER" | "VALIDATOR" | "CALCULATOR" | "ORACLE";
    method: "" | "symbol" | "name" | "add" | "sub" | "mul" | "div" | "getAmountsOut" | "decimals" | "deposit" | "simpleSwap" | "swap" | "addLiquidityETH" | "removeLiquidityETH" | "withdraw" | "transferFrom" | "safeTransferFrom" | "setApprovalForAll" | "getAmountsIn" | "totalSupply" | "balanceOf" | "isApprovedForAll" | "supportsInterface" | "borrow" | "approve" | "mod" | "between" | "betweenEqual" | "equal" | "greaterEqual" | "greaterThan" | "lessEqual" | "lessThan" | "add_liquidity" | "remove_liquidity" | "swapExactTokensForTokens" | "swapExactETHForTokens" | "swapExactTokensForETH" | "swapTokensForExactTokens" | "swapTokensForExactETH" | "swapETHForExactTokens" | "simpleRemoveLiquidity" | "uniswapV3SwapTo" | "uniswapV3Swap" | "uniswapV3SwapToWithPermit" | "unoswap" | "repay" | "swapBorrowRateMode" | "flashLoan" | "buyOnUniswapV2Fork" | "megaSwap" | "multiSwap" | "simpleBuy" | "swapOnUniswapV2Fork" | "exchange" | "swapOnZeroXv4" | "mint" | "redeem" | "repayBorrow" | "enterMarkets" | "exitMarket" | "claimComp" | "supply" | "supplyFrom" | "supplyTo" | "withdrawFrom" | "withdrawTo" | "exchange_with_best_rate" | "remove_liquidity_one_coin" | "create_lock" | "increase_amount" | "increase_unlock_time" | "transfer" | "safeBatchTransferFrom" | "swapTo_noSlippageProtection" | "swap_noSlippageProtection" | "addLiquidity_noMinProtection" | "addLiquidityTo_noMinProtection" | "exactInput" | "exactInputSingle" | "exactOutput" | "exactOutputSingle" | "burn" | "increaseLiquidity" | "decreaseLiquidity" | "collect" | "getReserves" | "getUserAccountData" | "getReserveData" | "getUserReserveData" | "getReserveConfigurationData" | "getReserveTokensAddresses" | "getAssetPrice" | "latestRoundData" | "getAccountLiquidity" | "markets" | "borrowBalanceCurrent" | "collateralBalanceOf" | "isBorrowCollateralized" | "userBasic" | "borrowBalanceOf" | "getAssetInfoByAddress" | "getPrice" | "get_best_rate" | "get_exchange_amount" | "calc_token_amount" | "get_dy" | "locked" | "allowance" | "getApproved" | "ownerOf" | "tokenURI" | "balanceOfBatch" | "uri" | "simulateSwap" | "mulAndDiv" | "equalBytes32" | "positions" | "protocolFees" | "slot0" | "ticks" | "getEthBalance";
    input: {
        to: string | import("../..").Variable;
        value: string | import("../..").Variable | undefined;
        methodParams: {};
    };
}>;
