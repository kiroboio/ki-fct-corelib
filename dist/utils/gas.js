"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGasPrices = exports.transactionValidator = void 0;
const ethers_1 = require("ethers");
const FCT_Actuator_abi_json_1 = __importDefault(require("../abi/FCT_Actuator.abi.json"));
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
        if (txVal.errorIsValid) {
            return {
                isValid: true,
                txData: { gas: 1000000, ...gasPrice, type: 2 },
                prices: {
                    gas: 1000000,
                    gasPrice: gasPrice.maxFeePerGas,
                },
                error: null,
            };
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
const getGasPrices = async ({ rpcUrl, chainId: chainIdParam, historicalBlocks = 10, tries = 40, }) => {
    function avg(arr) {
        const sum = arr.reduce((a, v) => a + v);
        return Math.round(sum / arr.length);
    }
    const provider = new ethers_1.ethers.providers.JsonRpcProvider(rpcUrl);
    const { chainId } = chainIdParam ? { chainId: chainIdParam } : await provider.getNetwork();
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
            const generateBody = () => {
                return JSON.stringify({
                    jsonrpc: "2.0",
                    method: "eth_feeHistory",
                    params: [historicalBlocks, `0x${blockNumber.toString(16)}`, [2, 5, 10, 25]],
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
            // Add 5% to fast and fastest
            const fast = avg(blocks.map((b) => b.priorityFeePerGas[2])) +
                Math.round(avg(blocks.map((b) => b.priorityFeePerGas[2])) * 0.05);
            const fastest = avg(blocks.map((b) => b.priorityFeePerGas[3])) +
                Math.round(avg(blocks.map((b) => b.priorityFeePerGas[3])) * 0.05);
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
// 38270821632831754769812 - kiro price
// 1275004198 - max fee
// 462109 - gas
