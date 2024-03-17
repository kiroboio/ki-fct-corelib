"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transactionValidator = void 0;
const tslib_1 = require("tslib");
const ethers_1 = require("ethers");
const FCT_Actuator_abi_json_1 = tslib_1.__importDefault(require("../abi/FCT_Actuator.abi.json"));
const classes_1 = require("../batchMultiSigCall/classes");
const Interfaces_1 = require("../helpers/Interfaces");
const transactionValidator = async (txVal) => {
    const { callData, actuatorContractAddress, activator, rpcUrl, activateForFree } = txVal;
    let { gasPrice } = txVal;
    const decodedFCTCalldata = Interfaces_1.Interfaces.FCT_BatchMultiSigCall.decodeFunctionData("batchMultiSigCall", callData);
    const { maxGasPrice, dryRun } = classes_1.SessionID.parse(decodedFCTCalldata[1].sessionId.toHexString());
    if (dryRun) {
        gasPrice = { maxFeePerGas: "0", maxPriorityFeePerGas: "0" };
    }
    else {
        if (BigInt(maxGasPrice) < BigInt(gasPrice.maxFeePerGas)) {
            gasPrice = { maxFeePerGas: maxGasPrice.toString(), maxPriorityFeePerGas: "0" };
        }
    }
    // if (!dryRun && BigInt(maxGasPrice) < BigInt(gasPrice.maxFeePerGas)) {
    //   const networkFeeInGwei = ethers.utils.formatUnits(gasPrice.maxFeePerGas.toString(), "gwei");
    //   const fctMaxGasPriceInGwei = ethers.utils.formatUnits(maxGasPrice.toString(), "gwei");
    //   return {
    //     isValid: false,
    //     txData: { gas: 0, ...gasPrice, type: 2 },
    //     prices: {
    //       gas: 0,
    //       gasPrice: (gasPrice as EIP1559GasPrice).maxFeePerGas,
    //     },
    //     error: `Network gas price (${networkFeeInGwei} Gwei) is higher than FCT max gas price (${fctMaxGasPriceInGwei} Gwei)`,
    //   };
    // }
    const provider = new ethers_1.ethers.providers.JsonRpcProvider(rpcUrl);
    const actuatorContract = new ethers_1.ethers.Contract(actuatorContractAddress, FCT_Actuator_abi_json_1.default, provider);
    try {
        const gas = await provider.estimateGas({
            to: actuatorContractAddress,
            data: actuatorContract.interface.encodeFunctionData(activateForFree ? "activateForFree" : "activate", [
                callData,
                activator,
            ]),
            ...gasPrice,
            from: activator,
        });
        if (gas.lt(40000)) {
            throw new Error("Unknown error - FCT execution finalized too quickly. Is there enough power for user?");
        }
        // Add 20% to gasUsed value, calculate with BigInt
        const gasUsed = Math.round(gas.toNumber() + gas.toNumber() * 0.2);
        return {
            isValid: true,
            txData: { gas: gasUsed, ...gasPrice, type: 2 },
            prices: { gas: gasUsed, gasPrice: gasPrice.maxFeePerGas },
            error: null,
        };
    }
    catch (err) {
        if (dryRun && err.reason.includes("dry run success")) {
            return {
                isValid: true,
                txData: { gas: 0, ...gasPrice, type: 2 },
                prices: {
                    gas: 0,
                    gasPrice: gasPrice.maxFeePerGas,
                },
                error: null,
            };
        }
        if (err.reason === "processing response error") {
            throw err;
        }
        if (txVal.errorIsValid) {
            return {
                isValid: true,
                txData: { gas: 1_000_000, ...gasPrice, type: 2 },
                prices: {
                    gas: 1_000_000, // 900k is the default gas limit
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
            error: err.reason ? err.reason : err.message,
        };
    }
};
exports.transactionValidator = transactionValidator;
//# sourceMappingURL=transactionValidator.js.map