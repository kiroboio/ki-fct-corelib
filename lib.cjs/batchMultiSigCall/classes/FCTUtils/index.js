"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FCTUtils = void 0;
const tslib_1 = require("tslib");
const eth_sig_util_1 = require("@metamask/eth-sig-util");
const ethers_1 = require("ethers");
const graphlib_1 = require("graphlib");
const node_cache_1 = tslib_1.__importDefault(require("node-cache"));
const constants_1 = require("../../../constants");
const helpers_1 = require("../../../helpers");
const deepMerge_1 = require("../../../helpers/deepMerge");
const Interfaces_1 = require("../../../helpers/Interfaces");
const utils_1 = require("../../utils");
const getAllRequiredApprovals_1 = require("../../utils/getAllRequiredApprovals");
const CallID_1 = require("../CallID");
const EIP712_1 = require("../EIP712");
const FCTBase_1 = require("../FCTBase");
const constants_2 = require("./constants");
const getPaymentPerPayer_1 = require("./getPaymentPerPayer");
const helpers_2 = require("./helpers");
class FCTUtils extends FCTBase_1.FCTBase {
    _eip712;
    _cache = new node_cache_1.default();
    constructor(FCT) {
        super(FCT);
        this._eip712 = new EIP712_1.EIP712(FCT);
    }
    get FCTData() {
        return this.FCT.exportFCT();
    }
    async getAllRequiredApprovals() {
        return (0, getAllRequiredApprovals_1.getAllRequiredApprovals)(this.FCT);
    }
    getCalldataForActuator({ signatures, purgedFCT, investor, activator, }) {
        return (0, utils_1.getCalldataForActuator)({
            signedFCT: (0, deepMerge_1.deepMerge)(this.FCTData, { signatures }),
            purgedFCT,
            investor,
            activator,
            version: this.FCT.version.slice(2),
        });
    }
    getAuthenticatorSignature() {
        return (0, utils_1.getAuthenticatorSignature)(this._eip712.getTypedData());
    }
    recoverAddress(signature) {
        try {
            const signatureString = ethers_1.utils.joinSignature(signature);
            return (0, eth_sig_util_1.recoverTypedSignature)({
                data: this.FCTData.typedData,
                version: eth_sig_util_1.SignTypedDataVersion.V4,
                signature: signatureString,
            });
        }
        catch (e) {
            return null;
        }
    }
    getMessageHash() {
        return ethers_1.ethers.utils.hexlify(eth_sig_util_1.TypedDataUtils.eip712Hash(this.FCTData.typedData, eth_sig_util_1.SignTypedDataVersion.V4));
    }
    isValid(softValidation = false) {
        const keys = Object.keys(this.FCTData);
        this._validateFCTKeys(keys);
        const limits = this.FCTData.typedData.message.limits;
        const engine = this.FCTData.typedData.message.engine;
        const currentDate = new Date().getTime() / 1000;
        const validFrom = parseInt(limits.valid_from);
        const expiresAt = parseInt(limits.expires_at);
        const gasPriceLimit = limits.gas_price_limit;
        if (!softValidation && validFrom > currentDate) {
            throw new Error(`FCT is not valid yet. FCT is valid from ${validFrom}`);
        }
        if (expiresAt < currentDate) {
            throw new Error(`FCT has expired. FCT expired at ${expiresAt}`);
        }
        if (gasPriceLimit === "0") {
            throw new Error(`FCT gas price limit cannot be 0`);
        }
        if (!engine.eip712) {
            throw new Error(`FCT must be type EIP712`);
        }
        return true;
    }
    getSigners() {
        return this.FCTData.mcall.reduce((acc, { from }) => {
            // Check if the address is already in the accumulator
            // And it is not an address from secureStorageAddresses. If it is, we dont
            // want to add it to the signers array
            const doNotReturn = constants_2.secureStorageAddresses.find((address) => address.address.toLowerCase() === from.toLowerCase() && address.chainId === this.FCT.chainId);
            if (!acc.includes(from) && !doNotReturn) {
                acc.push(from);
            }
            return acc;
        }, []);
    }
    getAllPaths() {
        const FCT = this.FCTData;
        const g = new graphlib_1.Graph({ directed: true });
        FCT.mcall.forEach((_, index) => {
            g.setNode(index.toString());
        });
        const continueOnSuccessFlows = [constants_1.Flow.OK_CONT_FAIL_REVERT, constants_1.Flow.OK_CONT_FAIL_STOP, constants_1.Flow.OK_CONT_FAIL_CONT];
        const continueOnFailFlows = [constants_1.Flow.OK_REVERT_FAIL_CONT, constants_1.Flow.OK_STOP_FAIL_CONT, constants_1.Flow.OK_CONT_FAIL_CONT];
        const endFlows = [
            constants_1.Flow.OK_STOP_FAIL_STOP,
            constants_1.Flow.OK_STOP_FAIL_REVERT,
            constants_1.Flow.OK_REVERT_FAIL_STOP,
            constants_1.Flow.OK_CONT_FAIL_STOP,
            constants_1.Flow.OK_STOP_FAIL_CONT,
        ];
        const dontAddEdge = [constants_1.Flow.OK_STOP_FAIL_STOP, constants_1.Flow.OK_STOP_FAIL_REVERT, constants_1.Flow.OK_REVERT_FAIL_STOP];
        const ends = [(FCT.mcall.length - 1).toString()];
        for (let i = 0; i < FCT.mcall.length - 1; i++) {
            const callID = CallID_1.CallID.parseWithNumbers(FCT.mcall[i].callId);
            const flow = callID.options.flow;
            const jumpOnSuccess = callID.options.jumpOnSuccess;
            const jumpOnFail = callID.options.jumpOnFail;
            if (jumpOnSuccess === jumpOnFail) {
                if (!dontAddEdge.includes(flow)) {
                    g.setEdge(i.toString(), (i + 1 + +jumpOnSuccess).toString());
                }
            }
            else {
                if (continueOnSuccessFlows.includes(flow)) {
                    g.setEdge(i.toString(), (i + 1 + +jumpOnSuccess).toString());
                }
                if (continueOnFailFlows.includes(flow)) {
                    g.setEdge(i.toString(), (i + 1 + +jumpOnFail).toString());
                }
            }
            if (endFlows.includes(flow)) {
                ends.push(i.toString());
            }
        }
        const start = "0";
        const allPaths = [];
        const pathList = [start];
        const uniqueEnds = Array.from(new Set(ends));
        for (const end of uniqueEnds) {
            const printAllPathsUtil = (g, start, end, localPathList) => {
                if (start === end) {
                    const path = localPathList.slice();
                    allPaths.push(path);
                    return;
                }
                let successors = g.successors(start);
                if (successors === undefined) {
                    successors = [];
                }
                for (const id of successors) {
                    localPathList.push(id);
                    printAllPathsUtil(g, id, end, localPathList);
                    localPathList.splice(localPathList.indexOf(id), 1);
                }
            };
            printAllPathsUtil(g, start, end, pathList);
        }
        return allPaths;
    }
    async getAssetFlow() {
        const allPaths = this.getAllPaths();
        const allCalls = this.FCT.calls;
        const assetFlow = await Promise.all(allPaths.map(async (path) => {
            const calls = path.map((index) => allCalls[Number(index)]);
            const assetFlow = [];
            for (const call of calls) {
                const plugin = call.plugin;
                if (!plugin) {
                    return [];
                }
                const callAssetFlow = await plugin.getAssetFlow();
                // Check if the address is already in the accumulator
                for (const flow of callAssetFlow) {
                    const index = assetFlow.findIndex((accAsset) => accAsset.address === flow.address);
                    if (index === -1) {
                        assetFlow.push(flow);
                    }
                    else {
                        const data = assetFlow[index];
                        for (const token of flow.toReceive) {
                            const tokenIndex = data.toReceive.findIndex((accToken) => accToken.token === token.token);
                            if (tokenIndex !== -1) {
                                data.toReceive[tokenIndex].amount = (BigInt(data.toReceive[tokenIndex].amount) +
                                    BigInt(helpers_1.InstanceOf.Variable(token.amount) ? 0 : token.amount)).toString();
                            }
                            else {
                                data.toReceive.push(token);
                            }
                        }
                        for (const token of flow.toSpend) {
                            const tokenIndex = data.toSpend.findIndex((accToken) => accToken.token === token.token);
                            if (tokenIndex !== -1) {
                                data.toSpend[tokenIndex].amount = (BigInt(data.toSpend[tokenIndex].amount) +
                                    BigInt(helpers_1.InstanceOf.Variable(token.amount) ? 0 : token.amount)).toString();
                            }
                            else {
                                data.toSpend.push(token);
                            }
                        }
                    }
                }
            }
            return {
                path,
                assetFlow,
            };
        }));
        return assetFlow;
    }
    kiroPerPayerGas = ({ gas, gasPrice, penalty, ethPriceInKIRO, fees, }) => {
        const baseFeeBPS = fees?.baseFeeBPS ? BigInt(fees.baseFeeBPS) : 1000n;
        const bonusFeeBPS = fees?.bonusFeeBPS ? BigInt(fees.bonusFeeBPS) : 5000n;
        const gasBigInt = BigInt(gas);
        const limits = this.FCTData.typedData.message.limits;
        const maxGasPrice = BigInt(limits.gas_price_limit);
        const gasPriceBigInt = BigInt(gasPrice) > maxGasPrice ? maxGasPrice : BigInt(gasPrice);
        const effectiveGasPrice = BigInt((0, getPaymentPerPayer_1.getEffectiveGasPrice)({
            gasPrice: gasPriceBigInt,
            maxGasPrice,
            baseFeeBPS,
            bonusFeeBPS,
        }));
        const base = gasBigInt * gasPriceBigInt;
        const fee = gasBigInt * (effectiveGasPrice - gasPriceBigInt);
        const ethCost = base + fee;
        const kiroCost = (ethCost * BigInt(ethPriceInKIRO)) / 10n ** 18n;
        return {
            ethCost: ((ethCost * BigInt(penalty || 10_000)) / 10000n).toString(),
            kiroCost: kiroCost.toString(),
        };
    };
    getPaymentPerPayer = ({ signatures, gasPrice, maxGasPrice, ethPriceInKIRO, penalty, fees, }) => {
        const baseFeeBPS = fees?.baseFeeBPS ? BigInt(fees.baseFeeBPS) : 1000n;
        const bonusFeeBPS = fees?.bonusFeeBPS ? BigInt(fees.bonusFeeBPS) : 5000n;
        const fct = this.FCTData;
        const allPathsKey = JSON.stringify(fct);
        let allPaths = this._cache.get(allPathsKey);
        if (!allPaths) {
            allPaths = this.getAllPaths();
            this._cache.set(allPathsKey, allPaths);
        }
        const limits = fct.typedData.message.limits;
        maxGasPrice = maxGasPrice ? BigInt(maxGasPrice) : BigInt(limits.gas_price_limit);
        const txGasPrice = gasPrice ? BigInt(gasPrice) : maxGasPrice;
        const effectiveGasPrice = BigInt((0, getPaymentPerPayer_1.getEffectiveGasPrice)({
            gasPrice: txGasPrice,
            maxGasPrice,
            baseFeeBPS,
            bonusFeeBPS,
        }));
        fct.signatures = signatures || [];
        const calldata = this.getCalldataForActuator({
            activator: "0x0000000000000000000000000000000000000000",
            investor: "0x0000000000000000000000000000000000000000",
            purgedFCT: "0x".padEnd(66, "0"),
            signatures: fct.signatures,
        });
        const data = allPaths.map((path) => {
            const payers = (0, getPaymentPerPayer_1.getPayersForRoute)({
                chainId: this.FCT.chainId,
                calldata,
                calls: fct.mcall,
                pathIndexes: path,
            });
            return payers.reduce((acc, payer) => {
                const base = payer.gas * txGasPrice;
                const fee = payer.gas * (effectiveGasPrice - txGasPrice);
                const ethCost = base + fee;
                return {
                    ...acc,
                    [payer.payer]: {
                        ...payer,
                        pureEthCost: ethCost,
                        ethCost: (ethCost * BigInt(penalty || 10_000)) / 10000n,
                    },
                };
            }, {});
        });
        const allPayers = [
            ...new Set(fct.mcall
                .map((call) => {
                const { payerIndex } = CallID_1.CallID.parse(call.callId);
                if (payerIndex === 0)
                    return ethers_1.ethers.constants.AddressZero;
                const payer = fct.mcall[payerIndex - 1].from;
                return payer;
            })
                .filter((payer) => payer !== ethers_1.ethers.constants.AddressZero)),
        ];
        return allPayers.map((payer) => {
            const { largest, smallest } = data.reduce((acc, pathData) => {
                const currentValues = acc;
                const currentLargestValue = currentValues.largest?.ethCost || 0n;
                const currentSmallestValue = currentValues.smallest?.ethCost;
                const value = pathData[payer]?.pureEthCost || 0n;
                if (!currentLargestValue || value > currentLargestValue) {
                    currentValues.largest = pathData[payer];
                }
                if (!currentSmallestValue || value < currentSmallestValue) {
                    currentValues.smallest = pathData[payer];
                }
                return currentValues;
            }, {});
            const largestKiroCost = (0, getPaymentPerPayer_1.getCostInKiro)({ ethPriceInKIRO, ethCost: largest.pureEthCost });
            const smallestKiroCost = (0, getPaymentPerPayer_1.getCostInKiro)({ ethPriceInKIRO, ethCost: smallest.pureEthCost });
            return {
                payer,
                largestPayment: {
                    gas: largest.gas.toString(),
                    tokenAmountInWei: largestKiroCost,
                    nativeAmountInWei: largest.ethCost.toString(),
                    tokenAmount: ethers_1.utils.formatEther(largestKiroCost),
                    nativeAmount: ethers_1.utils.formatEther(largest.ethCost.toString()),
                },
                smallestPayment: {
                    gas: smallest.gas.toString(),
                    tokenAmountInWei: smallestKiroCost,
                    nativeAmountInWei: smallest.ethCost.toString(),
                    tokenAmount: ethers_1.utils.formatEther(smallestKiroCost),
                    nativeAmount: ethers_1.utils.formatEther(smallest.ethCost.toString()),
                },
            };
        });
    };
    getMaxGas = () => {
        const allPayers = this.getPaymentPerPayer({ ethPriceInKIRO: "0" });
        return allPayers.reduce((acc, payer) => {
            const largestGas = payer.largestPayment.gas;
            if (BigInt(largestGas) > BigInt(acc)) {
                return largestGas;
            }
            return acc;
        }, "0");
    };
    getCallResults = async ({ rpcUrl, provider, txHash, }) => {
        if (!provider && !rpcUrl) {
            throw new Error("Either provider or rpcUrl is required");
        }
        if (!provider) {
            provider = new ethers_1.ethers.providers.JsonRpcProvider(rpcUrl);
        }
        const txReceipt = await provider.getTransactionReceipt(txHash);
        const batchMultiSigInterface = Interfaces_1.Interfaces.FCT_BatchMultiSigCall;
        (0, helpers_2.verifyMessageHash)(txReceipt.logs, this.getMessageHash());
        const mapLog = (log) => {
            const parsedLog = batchMultiSigInterface.parseLog(log);
            return {
                id: parsedLog.args.id,
                caller: parsedLog.args.caller,
                callIndex: parsedLog.args.callIndex.toString(),
            };
        };
        const successCalls = txReceipt.logs
            .filter((log) => {
            try {
                return batchMultiSigInterface.parseLog(log).name === "FCTE_CallSucceed";
            }
            catch (e) {
                return false;
            }
        })
            .map(mapLog);
        const failedCalls = txReceipt.logs
            .filter((log) => {
            try {
                return batchMultiSigInterface.parseLog(log).name === "FCTE_CallFailed";
            }
            catch (e) {
                return false;
            }
        })
            .map(mapLog);
        const callResultConstants = {
            success: "SUCCESS",
            failed: "FAILED",
            skipped: "SKIPPED",
        };
        const manageResult = (index) => {
            if (successCalls.find((successCall) => successCall.callIndex === index))
                return callResultConstants.success;
            if (failedCalls.find((failedCall) => failedCall.callIndex === index))
                return callResultConstants.failed;
            return callResultConstants.skipped;
        };
        return this.FCT.calls.map((_, index) => {
            const indexString = (index + 1).toString();
            return {
                index: indexString,
                result: manageResult(indexString),
            };
        });
    };
    getTransactionTrace = async ({ txHash, tenderlyRpcUrl, tries = 3, }) => {
        const provider = new ethers_1.ethers.providers.JsonRpcProvider(tenderlyRpcUrl);
        let keepTrying = true;
        do {
            try {
                // throw new Error("Tenderly trace is not working");
                const data = await provider.send("tenderly_traceTransaction", [txHash]);
                if (!data || !data.trace || !data.logs) {
                    throw new Error("Tenderly trace is not working");
                }
                const rawLogs = data.logs.map((log) => log.raw);
                (0, helpers_2.verifyMessageHash)(rawLogs, this.getMessageHash());
                const executedCalls = (0, helpers_2.executedCallsFromLogs)(rawLogs);
                const callsFromTenderlyTrace = data.trace.filter((call) => {
                    return (call.traceAddress.length === 7 &&
                        call.traceAddress[0] === 0 &&
                        call.traceAddress[1] === 0 &&
                        call.traceAddress[3] === 0 &&
                        call.traceAddress[4] === 0 &&
                        call.traceAddress[5] === 2 &&
                        call.traceAddress[6] === 2);
                });
                const fctCalls = this.FCT.calls;
                const allFCTComputed = this.FCT.computed;
                const traceData = executedCalls.reduce((acc, executedCall, index) => {
                    const fctCall = fctCalls[Number(executedCall.callIndex) - 1];
                    const callResult = callsFromTenderlyTrace[index];
                    const input = callResult.input;
                    const output = callResult.output;
                    const resData = fctCall.decodeData({
                        inputData: input,
                        outputData: output,
                    });
                    acc.calls = [
                        ...acc.calls,
                        {
                            method: fctCall.call.method ?? "",
                            value: callResult.value ? parseInt(callResult.value, 16).toString() : "0",
                            inputData: resData?.inputData ?? [],
                            outputData: resData?.outputData ?? [],
                            error: callResult.error || callResult.errorString || null,
                            isSuccess: executedCall.isSuccess,
                            id: fctCall.nodeId,
                        },
                    ];
                    (0, helpers_2.manageValidationAndComputed)(acc, fctCall, allFCTComputed);
                    return acc;
                }, {
                    calls: [],
                    validations: [],
                    computed: [],
                });
                keepTrying = false;
                return traceData;
            }
            catch (e) {
                if (tries > 0) {
                    await new Promise((resolve) => setTimeout(resolve, 3000));
                }
                else {
                    throw e;
                }
            }
        } while (keepTrying && tries-- > 0);
    };
    getSimpleTransactionTrace = async ({ txHash, rpcUrl }) => {
        const provider = new ethers_1.ethers.providers.JsonRpcProvider(rpcUrl);
        const txReceipt = await provider.getTransactionReceipt(txHash);
        (0, helpers_2.verifyMessageHash)(txReceipt.logs, this.getMessageHash());
        const executedCalls = (0, helpers_2.executedCallsFromLogs)(txReceipt.logs);
        const fctCalls = this.FCT.calls;
        const allFCTComputed = this.FCT.computed;
        return executedCalls.reduce((acc, executedCall) => {
            const fctCall = fctCalls[Number(executedCall.callIndex) - 1];
            acc.calls = [
                ...acc.calls,
                {
                    isSuccess: executedCall.isSuccess,
                    id: fctCall.nodeId,
                },
            ];
            (0, helpers_2.manageValidationAndComputed)(acc, fctCall, allFCTComputed);
            return acc;
        }, {
            calls: [],
            validations: [],
            computed: [],
        });
    };
    _validateFCTKeys(keys) {
        const validKeys = [
            "typeHash",
            "typedData",
            "sessionId",
            "nameHash",
            "mcall",
            "builderAddress",
            "variables",
            "externalSigners",
            "computed",
            "signatures",
        ];
        validKeys.forEach((key) => {
            if (!keys.includes(key)) {
                throw new Error(`FCT missing key ${key}`);
            }
        });
    }
}
exports.FCTUtils = FCTUtils;
//# sourceMappingURL=index.js.map