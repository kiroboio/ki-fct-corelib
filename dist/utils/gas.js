"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getKIROPayment = exports.getFCTGasEstimation = exports.getGasPriceEstimations = exports.transactionValidator = void 0;
const ethers_1 = require("ethers");
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const FCT_Actuator_abi_json_1 = __importDefault(require("../abi/FCT_Actuator.abi.json"));
const FCT_BatchMultiSigCall_abi_json_1 = __importDefault(require("../abi/FCT_BatchMultiSigCall.abi.json"));
const transactionValidator = async (txVal, pureGas = false) => {
    const { callData, actuatorContractAddress, actuatorPrivateKey, rpcUrl, activateForFree } = txVal;
    const provider = new ethers_1.ethers.providers.JsonRpcProvider(rpcUrl);
    const signer = new ethers_1.ethers.Wallet(actuatorPrivateKey, provider);
    const actuatorContract = new ethers_1.ethers.Contract(actuatorContractAddress, FCT_Actuator_abi_json_1.default, signer);
    const gasPrice = txVal.eip1559
        ? (await (0, exports.getGasPriceEstimations)({
            rpcUrl,
            historicalBlocks: 20,
        }))[txVal.gasPriority || "average"]
        : { gasPrice: (await provider.getGasPrice()).toNumber() };
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
        // Add 15% to gasUsed value
        const gasUsed = pureGas ? gas.toNumber() : Math.round(gas.toNumber() + gas.toNumber() * 0.15);
        if (txVal.eip1559 && "maxFeePerGas" in gasPrice) {
            return {
                isValid: true,
                txData: { gas: gasUsed, ...gasPrice, type: 2 },
                error: null,
            };
        }
        else {
            return {
                isValid: true,
                txData: { gas: gasUsed, ...gasPrice, type: 1 },
                error: null,
            };
        }
    }
    catch (err) {
        return {
            isValid: false,
            txData: { gas: 0, ...gasPrice, type: txVal.eip1559 ? 2 : 1 },
            error: err.reason,
        };
    }
};
exports.transactionValidator = transactionValidator;
const getGasPriceEstimations = async ({ rpcUrl, historicalBlocks, }) => {
    function avg(arr) {
        const sum = arr.reduce((a, v) => a + v);
        return Math.round(sum / arr.length);
    }
    const res = await fetch(rpcUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            jsonrpc: "2.0",
            method: "eth_feeHistory",
            params: [historicalBlocks, "latest", [25, 50, 75]],
            id: 1,
        }),
    });
    const { result } = await res.json();
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
    const baseFeePerGas = Number(result.baseFeePerGas[historicalBlocks]);
    return {
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
    };
};
exports.getGasPriceEstimations = getGasPriceEstimations;
const getFCTGasEstimation = async ({ fct, callData, batchMultiSigCallAddress, rpcUrl, }) => {
    const FCTOverhead = 135500;
    const callOverhead = 16370;
    const numOfCalls = fct.mcall.length;
    const actuator = new ethers_1.ethers.utils.Interface(FCT_Actuator_abi_json_1.default);
    const batchMultiSigCallContract = new ethers_1.ethers.Contract(batchMultiSigCallAddress, FCT_BatchMultiSigCall_abi_json_1.default, new ethers_1.ethers.providers.JsonRpcProvider(rpcUrl));
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
    let totalGas = new bignumber_js_1.default(0);
    for (const call of fct.mcall) {
        if (call.types.length > 0) {
            const gasForCall = await batchMultiSigCallContract.estimateGas.abiToEIP712(call.data, call.types, call.typedHashes, { data: 0, types: 0 });
            totalGas = totalGas.plus(gasForCall.toString());
        }
    }
    // Overhead calculation
    // FCTOverhead +
    // (totalCallDataCost - mcallTotalCost) +
    // (dataLength - mcallDataTotalLength) -
    // nonZero +
    // (new BigNumber(dataLength).times(600).div(32) - new BigNumber(mcallDataTotalLength).times(600).div(32)) / mcall.length
    const gasEstimation = new bignumber_js_1.default(FCTOverhead)
        .plus(new bignumber_js_1.default(callOverhead).times(numOfCalls))
        .plus(totalCallDataCost)
        .plus(calcMemory(dataLength))
        .minus(calcMemory(nonZero))
        .plus(new bignumber_js_1.default(dataLength).times(600).div(32))
        .plus(totalGas)
        .times(1.1); // Add 10% as a buffer
    return gasEstimation.toString();
};
exports.getFCTGasEstimation = getFCTGasEstimation;
// 38270821632831754769812 - kiro price
// 1275004198 - max fee
// 462109 - gas
// 34.910655705373187788
const getKIROPayment = async ({ fct, kiroPriceInETH, gasPrice, gasLimit, }) => {
    const vault = fct.typedData.message["transaction_1"].call.from;
    const gas = gasLimit;
    const gasPriceFormatted = ethers_1.utils.formatUnits(gasPrice, "gwei");
    const baseGasCost = new bignumber_js_1.default(gas).times(gasPriceFormatted).shiftedBy(-9);
    const limits = fct.typedData.message.limits;
    const maxGasPrice = limits.gas_price_limit;
    const effectiveGasPrice = (gasPrice * (10000 + 1000) + (Number(maxGasPrice) - gasPrice) * 5000) / 10000 / 1e9;
    const feeGasCost = new bignumber_js_1.default(gas).times(new bignumber_js_1.default(effectiveGasPrice).minus(gasPriceFormatted)).shiftedBy(-9);
    const totalCost = baseGasCost.plus(feeGasCost);
    const normalisedKiroPriceInETH = new bignumber_js_1.default(kiroPriceInETH).shiftedBy(-18);
    const kiroCost = totalCost.times(normalisedKiroPriceInETH);
    return {
        vault,
        amount: kiroCost.toString(),
    };
};
exports.getKIROPayment = getKIROPayment;
const getRequiredKIRO = async ({ fct, callData, batchMultiSigCallAddress, rpcUrl, }) => {
    const FCTOverhead = 135500;
    const callOverhead = 16370;
    const numOfCalls = fct.mcall.length;
    const actuator = new ethers_1.ethers.utils.Interface(FCT_Actuator_abi_json_1.default);
    const batchMultiSigCallContract = new ethers_1.ethers.Contract(batchMultiSigCallAddress, FCT_BatchMultiSigCall_abi_json_1.default, new ethers_1.ethers.providers.JsonRpcProvider(rpcUrl));
    // Overhead calculation
    // FCTOverhead +
    // (totalCallDataCost - mcallTotalCost) +
    // (dataLength - mcallDataTotalLength) -
    // nonZero +
    // (new BigNumber(dataLength).times(600).div(32) - new BigNumber(mcallDataTotalLength).times(600).div(32)) / mcall.length
    const calcMemory = (input) => {
        return input * 3 + (input * input) / 512;
    };
    const callDataCostReducer = (accumulator, item) => {
        if (item === "0")
            return accumulator + 4;
        return accumulator + 16;
    };
    const nonZeroReducer = (accumulator, item) => {
        if (item !== "0")
            return accumulator + 1;
        return accumulator + 0;
    };
    const dataLength = actuator.encodeFunctionData("activate", [callData, "0x0000000000000000000000000000000000000000"]).length / 2;
    const mcallTotalCost = 0;
    for (const call of fct.mcall) {
        const encodedMcall = ethers_1.utils.defaultAbiCoder.encode(["bytes32", "bytes32", "bytes32", "uint256", "uint256", "address", "address", "bytes", "uint256[]", "bytes32[]"], [call.data]);
    }
};
// const getRequiredKIRO = async ({
//   fct,
//   batchMultiSigCallAddress,
//   rpcUrl,
// }: {
//   fct: IFCT;
//   batchMultiSigCallAddress: string;
//   rpcUrl: string;
// }) => {
//   const batchMultiSigCallContract = new ethers.Contract(
//     batchMultiSigCallAddress,
//     BatchMultiSigCallABI,
//     new ethers.providers.JsonRpcProvider(rpcUrl)
//   );
//   const calcMemory = (input: number) => {
//     return input * 3 + (input * input) / 512;
//   };
//   const FCTOverhead = 135500;
//   const callOverhead = 16370;
//   const payers = {};
//   const commonGasPerCall = FCTOverhead / fct.mcall.length + callOverhead;
//   for (const call of fct.mcall) {
//     const dataLength = call.data.length / 2;
//     const callDataString = call.data.slice(2);
//     const callDataArray = callDataString.split("");
//     const totalCallDataCost = callDataArray.reduce((accumulator, item) => {
//       if (item === "0") return accumulator + 4;
//       else return accumulator + 16;
//     }, 0);
//     const nonZero = callDataArray.reduce((accumulator, item) => {
//       if (item !== "0") return accumulator + 1;
//       else return accumulator + 0;
//     }, 0);
//     const gasForCall = await batchMultiSigCallContract.estimateGas.abiToEIP712(
//       call.data,
//       call.types,
//       call.typedHashes,
//       { data: 0, types: 0 }
//     );
//     const gas = new BigNumber(totalCallDataCost)
//       .plus(calcMemory(dataLength))
//       .minus(calcMemory(nonZero))
//       .plus((dataLength * 600) / 32)
//       .plus(gasForCall.toString())
//       .plus(commonGasPerCall);
//     if (payers[call.from]) {
//       payers[call.from] = new BigNumber(payers[call.from]).plus(gas).toString();
//     } else {
//       payers[call.from] = gas.toString();
//     }
//   }
//   return payers;
// };
