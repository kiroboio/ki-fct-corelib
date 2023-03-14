"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FCTUtils = void 0;
const ki_eth_fct_provider_ts_1 = require("@kirobo/ki-eth-fct-provider-ts");
const eth_sig_util_1 = require("@metamask/eth-sig-util");
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const ethers_1 = require("ethers");
const graphlib_1 = require("graphlib");
const lodash_1 = __importDefault(require("lodash"));
const Interfaces_1 = require("../../../helpers/Interfaces");
const constants_1 = require("../../constants");
const utils_1 = require("../../utils");
const getAllRequiredApprovals_1 = require("../../utils/getAllRequiredApprovals");
const CallID_1 = require("../CallID");
const EIP712_1 = require("../EIP712");
const FCTBase_1 = require("../FCTBase");
const SessionID_1 = require("../SessionID");
class FCTUtils extends FCTBase_1.FCTBase {
    constructor(FCT) {
        super(FCT);
        // 38270821632831754769812 - kiro price
        // 1275004198 - max fee
        // 462109 - gas
        // TODO: Make this function deprecated. Use getPaymentPerPayer instead
        this.getKIROPayment = ({ kiroPriceInETH, gasPrice, gas, }) => {
            const fct = this.FCTData;
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
        this.getPaymentPerPayer = ({ signatures, gasPrice, kiroPriceInETH, penalty, }) => {
            const fct = this.FCTData;
            penalty = penalty || 1;
            const allPaths = this.getAllPaths();
            fct.signatures = signatures || [];
            const callData = this.getCalldataForActuator({
                activator: "0x0000000000000000000000000000000000000000",
                investor: "0x0000000000000000000000000000000000000000",
                purgedFCT: "0x".padEnd(66, "0"),
                signatures: fct.signatures,
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
                    const callId = CallID_1.CallID.parse(call.callId);
                    const payerIndex = callId.payerIndex;
                    const payer = fct.mcall[payerIndex - 1].from;
                    // 21000 - base fee of the call on EVMs
                    const gasForCall = (BigInt(callId.options.gasLimit) || BigInt(defaultCallGas)) - BigInt(21000);
                    const totalGasForCall = BigInt(FCTOverheadPerPayer) + BigInt(callOverhead) + gasForCall;
                    const callCost = totalGasForCall * BigInt(FCTgasPrice);
                    const callFee = totalGasForCall * BigInt(effectiveGasPrice);
                    const totalCallCost = callCost + callFee;
                    const kiroCost = (totalCallCost * BigInt(kiroPriceInETH)) / BigInt(1e18);
                    return {
                        ...acc,
                        [payer]: (BigInt(acc[payer] || 0) + kiroCost).toString(),
                    };
                }, {});
            });
            const allPayers = [
                ...new Set(fct.mcall.map((call) => {
                    const callId = CallID_1.CallID.parse(call.callId);
                    const payerIndex = callId.payerIndex;
                    const payer = fct.mcall[payerIndex - 1].from;
                    return payer;
                })),
            ];
            return allPayers.map((payer) => {
                const amount = data.reduce((acc, path) => {
                    return BigInt(acc) > BigInt(path[payer] || "0")
                        ? acc
                        : path[payer] || "0";
                }, "0");
                return {
                    payer,
                    amount,
                    amountInETH: (((BigInt(amount) * BigInt(1e18)) / BigInt(kiroPriceInETH)) * BigInt(penalty || 1)).toString(),
                };
            });
        };
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
            signedFCT: lodash_1.default.merge({}, this.FCTData, { signatures }),
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
    getOptions() {
        const parsedSessionID = SessionID_1.SessionID.asOptions({
            builder: this.FCTData.builder,
            sessionId: this.FCTData.sessionId,
            name: "",
        });
        return {
            valid_from: parsedSessionID.validFrom,
            expires_at: parsedSessionID.expiresAt,
            gas_price_limit: parsedSessionID.maxGasPrice,
            blockable: parsedSessionID.blockable,
            purgeable: parsedSessionID.purgeable,
            builder: parsedSessionID.builder,
            recurrency: parsedSessionID.recurrency,
            multisig: parsedSessionID.multisig,
            authEnabled: parsedSessionID.authEnabled,
        };
    }
    getMessageHash() {
        return ethers_1.ethers.utils.hexlify(eth_sig_util_1.TypedDataUtils.eip712Hash(this.FCTData.typedData, eth_sig_util_1.SignTypedDataVersion.V4));
    }
    isValid(softValidation = false) {
        const keys = Object.keys(this.FCTData);
        this.validateFCTKeys(keys);
        const limits = this.FCTData.typedData.message.limits;
        const fctData = this.FCTData.typedData.message.meta;
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
        if (!fctData.eip712) {
            throw new Error(`FCT must be type EIP712`);
        }
        return true;
    }
    getSigners() {
        return this.FCTData.mcall.reduce((acc, { from }) => {
            if (!acc.includes(from)) {
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
        for (let i = 0; i < FCT.mcall.length - 1; i++) {
            //   const callID = parseCallID(fct.mcall[i].callId, true);
            const callID = CallID_1.CallID.parseWithNumbers(FCT.mcall[i].callId);
            const jumpOnSuccess = callID.options.jumpOnSuccess;
            const jumpOnFail = callID.options.jumpOnFail;
            if (jumpOnSuccess === jumpOnFail) {
                g.setEdge(i.toString(), (i + 1 + Number(jumpOnSuccess)).toString());
            }
            else {
                g.setEdge(i.toString(), (i + 1 + Number(jumpOnSuccess)).toString());
                g.setEdge(i.toString(), (i + 1 + Number(jumpOnFail)).toString());
            }
        }
        const allPaths = [];
        const isVisited = {};
        const pathList = [];
        const start = "0";
        const end = (FCT.mcall.length - 1).toString();
        pathList.push(start);
        const printAllPathsUtil = (g, start, end, isVisited, localPathList) => {
            if (start === end) {
                const path = localPathList.slice();
                allPaths.push(path);
                return;
            }
            isVisited[start] = true;
            let successors = g.successors(start);
            if (successors === undefined) {
                successors = [];
            }
            for (const id of successors) {
                if (!isVisited[id]) {
                    localPathList.push(id);
                    printAllPathsUtil(g, id, end, isVisited, localPathList);
                    localPathList.splice(localPathList.indexOf(id), 1);
                }
            }
            isVisited[start] = false;
        };
        printAllPathsUtil(g, start, end, isVisited, pathList);
        return allPaths;
    }
    async estimateFCTCost({ callData, rpcUrl }) {
        const fct = this.FCTData;
        const chainId = Number(this.FCT.chainId);
        const FCTOverhead = 135500;
        const callOverhead = 16370;
        const numOfCalls = fct.mcall.length;
        const actuator = Interfaces_1.Interface.FCT_Actuator;
        const provider = new ethers_1.ethers.providers.JsonRpcProvider(rpcUrl);
        const batchMultiSigCallContract = new ethers_1.ethers.Contract(constants_1.addresses[chainId].FCT_BatchMultiSig, Interfaces_1.Interface.FCT_BatchMultiSigCall, provider);
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
    }
    validateFCTKeys(keys) {
        const validKeys = [
            "typeHash",
            "typedData",
            "sessionId",
            "nameHash",
            "mcall",
            "builder",
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
