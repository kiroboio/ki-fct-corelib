"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPaymentPerPayer = exports.getKIROPayment = exports.estimateFCTGasCost = exports.getGasPrices = exports.transactionValidator = void 0;
const ki_eth_fct_provider_ts_1 = require("@kirobo/ki-eth-fct-provider-ts");
const classes_1 = require("batchMultiSigCall/classes");
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const ethers_1 = require("ethers");
const utils_1 = require("ethers/lib/utils");
const FCT_Actuator_abi_json_1 = __importDefault(require("../abi/FCT_Actuator.abi.json"));
const FCT_BatchMultiSigCall_abi_json_1 = __importDefault(require("../abi/FCT_BatchMultiSigCall.abi.json"));
const batchMultiSigCall_1 = require("../batchMultiSigCall");
const FCT_1 = require("./FCT");
const transactionValidator = async (txVal, pureGas = false) => {
    const { callData, actuatorContractAddress, actuatorPrivateKey, rpcUrl, activateForFree, gasPrice } = txVal;
    const provider = new ethers_1.ethers.providers.JsonRpcProvider(rpcUrl);
    const signer = new ethers_1.ethers.Wallet(actuatorPrivateKey, provider);
    const actuatorContract = new ethers_1.ethers.Contract(actuatorContractAddress, FCT_Actuator_abi_json_1.default, signer);
    try {
        let gas;
        if (activateForFree) {
            gas = await actuatorContract.estimateGas.activateForFree(callData, signer.address, {
                ...gasPrice,
            });
        }
        else {
            gas = await actuatorContract.estimateGas.activate(callData, signer.address, {
                ...gasPrice,
            });
        }
        // Add 20% to gasUsed value
        const gasUsed = pureGas ? gas.toNumber() : Math.round(gas.toNumber() + gas.toNumber() * 0.2);
        return {
            isValid: true,
            txData: { gas: gasUsed, ...gasPrice, type: 2 },
            prices: { gas: gasUsed, gasPrice: gasPrice.maxFeePerGas },
            error: null,
        };
    }
    catch (err) {
        if (err.reason === "processing response error") {
            throw err;
        }
        return {
            isValid: false,
            txData: { gas: 0, ...gasPrice, type: 2 },
            prices: {
                gas: 0,
                gasPrice: gasPrice.maxFeePerGas,
            },
            error: err.reason,
        };
    }
};
exports.transactionValidator = transactionValidator;
const getGasPrices = async ({ rpcUrl, historicalBlocks = 10, tries = 40, }) => {
    function avg(arr) {
        const sum = arr.reduce((a, v) => a + v);
        return Math.round(sum / arr.length);
    }
    const provider = new ethers_1.ethers.providers.JsonRpcProvider(rpcUrl);
    let keepTrying = true;
    let returnValue;
    do {
        try {
            const latestBlock = await provider.getBlock("latest");
            if (!latestBlock.baseFeePerGas) {
                throw new Error("No baseFeePerGas");
            }
            const baseFee = latestBlock.baseFeePerGas.toString();
            const blockNumber = latestBlock.number;
            const res = await fetch(rpcUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    jsonrpc: "2.0",
                    method: "eth_feeHistory",
                    params: [historicalBlocks, (0, utils_1.hexlify)(blockNumber), [2, 5, 10, 25]],
                    id: 1,
                }),
            });
            const { result } = await res.json();
            if (!result) {
                throw new Error("No result");
            }
            let blockNum = parseInt(result.oldestBlock, 16);
            let index = 0;
            const blocks = [];
            while (blockNum < parseInt(result.oldestBlock, 16) + historicalBlocks) {
                blocks.push({
                    number: blockNum,
                    baseFeePerGas: Number(result.baseFeePerGas[index]),
                    gasUsedRatio: Number(result.gasUsedRatio[index]),
                    priorityFeePerGas: result.reward[index].map((x) => Number(x)),
                });
                blockNum += 1;
                index += 1;
            }
            const slow = avg(blocks.map((b) => b.priorityFeePerGas[0]));
            const average = avg(blocks.map((b) => b.priorityFeePerGas[1]));
            const fast = avg(blocks.map((b) => b.priorityFeePerGas[2]));
            const fastest = avg(blocks.map((b) => b.priorityFeePerGas[3]));
            const baseFeePerGas = Number(baseFee);
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
                    maxFeePerGas: fast + baseFeePerGas,
                    maxPriorityFeePerGas: fast,
                },
                fastest: {
                    maxFeePerGas: fastest + baseFeePerGas,
                    maxPriorityFeePerGas: fastest,
                },
            };
            keepTrying = false;
            return returnValue;
        }
        catch (err) {
            console.log("Error getting gas prices, retrying", err);
            if (tries > 0) {
                // Wait 3 seconds before retrying
                await new Promise((resolve) => setTimeout(resolve, 3000));
            }
            else {
                throw new Error("Could not get gas prices, issue might be related to node provider");
            }
        }
    } while (keepTrying && tries-- > 0);
    throw new Error("Could not get gas prices, issue might be related to node provider");
};
exports.getGasPrices = getGasPrices;
const estimateFCTGasCost = async ({ fct, callData, batchMultiSigCallAddress, rpcUrl, }) => {
    const FCTOverhead = 135500;
    const callOverhead = 16370;
    const numOfCalls = fct.mcall.length;
    const actuator = new ethers_1.ethers.utils.Interface(FCT_Actuator_abi_json_1.default);
    const provider = new ethers_1.ethers.providers.JsonRpcProvider(rpcUrl);
    const batchMultiSigCallContract = new ethers_1.ethers.Contract(batchMultiSigCallAddress, FCT_BatchMultiSigCall_abi_json_1.default, provider);
    const chainId = (await provider.getNetwork()).chainId;
    const calcMemory = (input) => {
        return input * 3 + (input * input) / 512;
    };
    const callDataString = callData.slice(2);
    const callDataArray = callDataString.split("");
    const totalCallDataCost = callDataArray.reduce((accumulator, item) => {
        if (item === "0")
            return accumulator + 4;
        return accumulator + 16;
    }, 21000);
    const nonZero = callDataArray.reduce((accumulator, item) => {
        if (item !== "0")
            return accumulator + 1;
        return accumulator + 0;
    }, 0);
    const dataLength = actuator.encodeFunctionData("activate", [callData, "0x0000000000000000000000000000000000000000"]).length / 2;
    let totalCallGas = new bignumber_js_1.default(0);
    for (const call of fct.mcall) {
        if (call.types.length > 0) {
            const gasForCall = await batchMultiSigCallContract.estimateGas.abiToEIP712(call.data, call.types, call.typedHashes, { data: 0, types: 0 });
            const pluginData = (0, ki_eth_fct_provider_ts_1.getPlugin)({
                address: call.to,
                chainId: chainId.toString(),
                signature: call.functionSignature,
            });
            if (pluginData) {
                const gasLimit = new pluginData.plugin({ chainId: chainId.toString() }).gasLimit;
                if (gasLimit) {
                    totalCallGas = totalCallGas.plus(gasLimit);
                }
            }
            totalCallGas = totalCallGas.plus(gasForCall.toString());
        }
    }
    const gasEstimation = new bignumber_js_1.default(FCTOverhead)
        .plus(new bignumber_js_1.default(callOverhead).times(numOfCalls))
        .plus(totalCallDataCost)
        .plus(calcMemory(dataLength))
        .minus(calcMemory(nonZero))
        .plus(new bignumber_js_1.default(dataLength).times(600).div(32))
        .plus(totalCallGas);
    return gasEstimation.toString();
};
exports.estimateFCTGasCost = estimateFCTGasCost;
// 38270821632831754769812 - kiro price
// 1275004198 - max fee
// 462109 - gas
const getKIROPayment = ({ fct, kiroPriceInETH, gasPrice, gas, }) => {
    const vault = fct.typedData.message["transaction_1"].call.from;
    const gasInt = BigInt(gas);
    const gasPriceFormatted = BigInt(gasPrice);
    const limits = fct.typedData.message.limits;
    const maxGasPrice = limits.gas_price_limit;
    // 1000 - baseFee
    // 5000 - bonusFee
    const effectiveGasPrice = (gasPriceFormatted * BigInt(10000 + 1000) + (BigInt(maxGasPrice) - gasPriceFormatted) * BigInt(5000)) /
        BigInt(10000);
    const feeGasCost = gasInt * (effectiveGasPrice - gasPriceFormatted);
    const baseGasCost = gasInt * gasPriceFormatted;
    const totalCost = baseGasCost + feeGasCost;
    const normalisedKiroPriceInETH = BigInt(kiroPriceInETH);
    const kiroCost = Number(totalCost * normalisedKiroPriceInETH) / 1e36;
    const amountInETH = Number(totalCost) / 1e18;
    return {
        vault,
        amountInKIRO: kiroCost.toString(),
        amountInETH: amountInETH.toString(),
    };
};
exports.getKIROPayment = getKIROPayment;
const getPaymentPerPayer = ({ fct, gasPrice, kiroPriceInETH, penalty, }) => {
    penalty = penalty || 1;
    const allPaths = (0, FCT_1.getAllFCTPaths)(fct);
    fct.signatures = fct.signatures || [];
    const callData = batchMultiSigCall_1.utils.getCalldataForActuator({
        signedFCT: fct,
        activator: "0x0000000000000000000000000000000000000000",
        investor: "0x0000000000000000000000000000000000000000",
        purgedFCT: "0x".padEnd(66, "0"),
        version: "010101",
    });
    const FCTOverhead = 35000 + 8500 * (fct.mcall.length + 1) + (79000 * callData.length) / 10000 + 135500;
    const callOverhead = 16370;
    const defaultCallGas = 50000;
    const limits = fct.typedData.message.limits;
    const maxGasPrice = limits.gas_price_limit;
    const FCTgasPrice = gasPrice ? gasPrice.toString() : maxGasPrice;
    const bigIntGasPrice = BigInt(FCTgasPrice);
    const effectiveGasPrice = ((bigIntGasPrice * BigInt(10000 + 1000) + (BigInt(maxGasPrice) - bigIntGasPrice) * BigInt(5000)) / BigInt(10000) -
        bigIntGasPrice).toString();
    const data = allPaths.map((path) => {
        const FCTOverheadPerPayer = (FCTOverhead / path.length).toFixed(0);
        return path.reduce((acc, callIndex) => {
            const call = fct.mcall[Number(callIndex)];
            const callId = classes_1.CallID.parse(call.callId);
            const payerIndex = callId.payerIndex;
            const payer = fct.mcall[payerIndex - 1].from;
            // 21000 - base fee of the call on EVMs
            const gasForCall = (BigInt(callId.options.gasLimit) || BigInt(defaultCallGas)) - BigInt(21000);
            const totalGasForCall = BigInt(FCTOverheadPerPayer) + BigInt(callOverhead) + gasForCall;
            const callCost = totalGasForCall * BigInt(FCTgasPrice);
            const callFee = totalGasForCall * BigInt(effectiveGasPrice);
            const totalCallCost = callCost + callFee;
            const kiroCost = new bignumber_js_1.default(totalCallCost.toString())
                .multipliedBy(new bignumber_js_1.default(kiroPriceInETH))
                .shiftedBy(-18 - 18)
                .toNumber();
            return {
                ...acc,
                [payer]: (0, bignumber_js_1.default)(acc[payer] || 0)
                    .plus(kiroCost)
                    .toString(),
            };
        }, {});
    });
    const allPayers = [
        ...new Set(fct.mcall.map((call) => {
            const callId = classes_1.CallID.parse(call.callId);
            const payerIndex = callId.payerIndex;
            const payer = fct.mcall[payerIndex - 1].from;
            return payer;
        })),
    ];
    return allPayers.map((payer) => {
        const amount = data.reduce((acc, path) => {
            return (0, bignumber_js_1.default)(acc).isGreaterThan(path[payer] || "0")
                ? acc
                : path[payer] || "0";
        }, "0");
        return {
            payer,
            amount,
            amountInETH: (0, bignumber_js_1.default)(amount)
                .div((0, bignumber_js_1.default)(kiroPriceInETH).shiftedBy(18))
                .multipliedBy(penalty || 1)
                .toString(),
        };
    });
};
exports.getPaymentPerPayer = getPaymentPerPayer;
