import { SignatureLike } from "@ethersproject/bytes";
import { recoverTypedSignature, SignTypedDataVersion, TypedDataUtils, TypedMessage } from "@metamask/eth-sig-util";
import { ethers, utils } from "ethers";
import { Graph } from "graphlib";

import { addresses } from "../../../constants";
import { InstanceOf } from "../../../helpers";
import { BatchMultiSigCall } from "../../batchMultiSigCall";
import { TypedDataTypes } from "../../types";
import { getAuthenticatorSignature } from "../../utils";
import { getAllRequiredApprovals } from "../../utils/getAllRequiredApprovals";
import { getVersionClass } from "../../versions/getVersion";
import { EIP712 } from "../EIP712";
import { FCTBase } from "../FCTBase";
import { SecureStorageAddressesSet } from "./constants";
import { ISimpleTxTrace } from "./types";
import { getEffectiveGasPrice, getPayerMap, preparePaymentPerPayerResult } from "./utils/getPaymentPerPayer";
import { getPathsFromGraph, manageFCTNodesInGraph } from "./utils/paths";
import {
  executedCallsFromLogs,
  executedCallsFromRawLogs,
  getCallsFromTrace,
  getTraceData,
  manageValidationAndComputed,
  verifyMessageHash,
} from "./utils/transactionTrace";

export class FCTUtils extends FCTBase {
  private _eip712: EIP712;
  private _cache = new Map();

  constructor(FCT: BatchMultiSigCall) {
    super(FCT);
    this._eip712 = new EIP712(FCT);
  }

  public get FCTData() {
    return this.FCT.exportFCT();
  }

  public async getAllRequiredApprovals() {
    return getAllRequiredApprovals(this.FCT);
  }

  public getCalldataForActuator({
    signatures,
    purgedFCT = ethers.constants.HashZero,
    investor = ethers.constants.AddressZero,
    activator,
    externalSigners = [],
    variables = [],
  }: {
    signatures: SignatureLike[];
    purgedFCT?: string;
    investor?: string;
    activator: string;
    externalSigners?: string[];
    variables?: string[];
  }) {
    const Version = getVersionClass(this.FCT);
    return Version.Utils.getCalldataForActuator({
      signatures,
      purgedFCT,
      investor,
      activator,
      externalSigners,
      variables,
    });
  }

  public getAuthenticatorSignature(): SignatureLike {
    return getAuthenticatorSignature(this._eip712.getTypedData());
  }

  public recoverAddress(signature: SignatureLike): string | null {
    try {
      const FCT = this.FCT;
      const data = new EIP712(FCT).getTypedData() as unknown as TypedMessage<TypedDataTypes>;
      return recoverTypedSignature<SignTypedDataVersion.V4, TypedDataTypes>({
        data,
        version: SignTypedDataVersion.V4,
        signature: utils.joinSignature(signature),
      });
    } catch (e) {
      return null;
    }
  }

  public getMessageHash(): string {
    const buffer = TypedDataUtils.eip712Hash(
      this.FCTData.typedData as unknown as TypedMessage<TypedDataTypes>,
      SignTypedDataVersion.V4,
    );
    return `0x${buffer.toString("hex")}`;
  }

  public isValid(softValidation = false): { valid: boolean; message: string | null } {
    const options = this.FCT.options;

    const currentDate = new Date().getTime() / 1000;
    const validFrom = typeof options.validFrom === "number" ? options.validFrom : parseInt(options.validFrom);
    const expiresAt = typeof options.expiresAt === "number" ? options.expiresAt : parseInt(options.expiresAt);

    if (!softValidation && validFrom > currentDate) {
      return { valid: false, message: `FCT is not valid yet. FCT is valid from ${validFrom}` };
    }

    if (expiresAt < currentDate) {
      return { valid: false, message: `FCT has expired. FCT expired at ${expiresAt}` };
    }

    // if (gasPriceLimit === "0") {
    //   return { valid: false, message: `FCT gas price limit cannot be 0` };
    // }

    return { valid: true, message: null };
  }

  public getSigners(): string[] {
    return this.FCT.calls.reduce((acc: string[], call) => {
      const from = call.get().from;
      if (typeof from !== "string") return acc;
      // const doNotReturn = secureStorageAddresses.find(
      //   (address) => address.address.toLowerCase() === from.toLowerCase() && address.chainId === this.FCT.chainId,
      // );

      const doNotReturn = SecureStorageAddressesSet.has(from.toLowerCase());

      if (!acc.includes(from) && !doNotReturn) {
        acc.push(from);
      }
      return acc;
    }, []);
  }

  public getAllPaths(): string[][] {
    const FCT = this.FCT;
    const g = new Graph({ directed: true });

    const ends = manageFCTNodesInGraph({
      calls: this.FCT.calls,
      FCT,
      g,
    });

    return getPathsFromGraph({
      g,
      ends,
    });
  }

  public async getAssetFlow() {
    const allPaths = this.getAllPaths();
    const allCalls = this.FCT.calls;

    const assetFlow = await Promise.all(
      allPaths.map(async (path) => {
        const calls = path.map((index) => allCalls[Number(index)]);

        const assetFlow: {
          address: string;
          toSpend: any[];
          toReceive: any[];
        }[] = [];

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
            } else {
              const data = assetFlow[index];

              for (const token of flow.toReceive) {
                const tokenIndex = data.toReceive.findIndex((accToken) => accToken.token === token.token);
                if (tokenIndex !== -1) {
                  data.toReceive[tokenIndex].amount = (
                    BigInt(data.toReceive[tokenIndex].amount) +
                    BigInt(InstanceOf.Variable(token.amount) ? 0 : token.amount)
                  ).toString();
                } else {
                  data.toReceive.push(token);
                }
              }

              for (const token of flow.toSpend) {
                const tokenIndex = data.toSpend.findIndex((accToken) => accToken.token === token.token);
                if (tokenIndex !== -1) {
                  data.toSpend[tokenIndex].amount = (
                    BigInt(data.toSpend[tokenIndex].amount) +
                    BigInt(InstanceOf.Variable(token.amount) ? 0 : token.amount)
                  ).toString();
                } else {
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
      }),
    );

    return assetFlow;
  }

  public kiroPerPayerGas = ({
    gas,
    gasPrice,
    penalty,
    ethPriceInKIRO,
    fees,
  }: {
    gas: string | bigint;
    gasPrice: string | bigint;
    penalty?: string | number;
    ethPriceInKIRO: string | bigint;
    fees?: {
      baseFeeBPS?: number;
      bonusFeeBPS?: number;
    };
  }) => {
    const baseFeeBPS = fees?.baseFeeBPS ? BigInt(fees.baseFeeBPS) : 1000n;
    const bonusFeeBPS = fees?.bonusFeeBPS ? BigInt(fees.bonusFeeBPS) : 5000n;

    const gasBigInt = BigInt(gas);

    const limits = this.FCTData.typedData.message.limits;
    // TODO: Support multi-versioning
    const maxGasPrice = BigInt(limits.max_payable_gas_price);

    const gasPriceBigInt = BigInt(gasPrice) > maxGasPrice ? maxGasPrice : BigInt(gasPrice);

    const effectiveGasPrice = BigInt(
      getEffectiveGasPrice({
        gasPrice: gasPriceBigInt,
        maxGasPrice,
        baseFeeBPS,
        bonusFeeBPS,
      }),
    );

    const base = gasBigInt * gasPriceBigInt;
    const fee = gasBigInt * (effectiveGasPrice - gasPriceBigInt);
    const ethCost = base + fee;

    const kiroCost = (ethCost * BigInt(ethPriceInKIRO)) / 10n ** 18n;

    return {
      ethCost: ((ethCost * BigInt(penalty || 10_000)) / 10_000n).toString(),
      kiroCost: kiroCost.toString(),
    };
  };

  public getPaymentPerPayer = ({
    signatures,
    gasPrice,
    maxGasPrice,
    ethPriceInKIRO,
    penalty,
    fees,
  }: {
    signatures?: SignatureLike[];
    gasPrice?: number | string | bigint;
    maxGasPrice?: number | string | bigint;
    ethPriceInKIRO: string | bigint;
    penalty?: number | string;
    fees?: {
      baseFeeBPS?: number | string;
      bonusFeeBPS?: number | string;
    };
  }) => {
    const calls = this.FCT.calls;
    const options = this.FCT.options;
    signatures = signatures || [];

    const fctID = JSON.stringify(options) + JSON.stringify(this.FCT.callsAsObjects);
    let allPaths = this._cache.get(fctID + "allPaths") as ReturnType<this["getAllPaths"]>;
    let calldata = this._cache.get(fctID + "calldata") as string;

    if (!allPaths) {
      allPaths = this.getAllPaths() as ReturnType<this["getAllPaths"]>;
      this._cache.set(fctID + "allPaths", allPaths);
    }

    if (!calldata) {
      calldata = this.getCalldataForActuator({
        activator: "0x0000000000000000000000000000000000000000",
        investor: "0x0000000000000000000000000000000000000000",
        purgedFCT: "0x".padEnd(66, "0"),
        signatures,
      });
      this._cache.set(fctID + "calldata", calldata);
    }

    console.time("payerMap");
    const payerMap = getPayerMap({
      FCT: this.FCT,
      fctID,
      // chainId: this.FCT.chainId,
      paths: allPaths,
      calldata,
      calls,
      payableGasLimit: Number(options.payableGasLimit) === 0 ? undefined : BigInt(options.payableGasLimit),
      maxGasPrice: maxGasPrice ? BigInt(maxGasPrice) : BigInt(options.maxGasPrice),
      gasPrice: gasPrice ? BigInt(gasPrice) : BigInt("0"),
      baseFeeBPS: fees?.baseFeeBPS ? BigInt(fees.baseFeeBPS) : 1000n,
      bonusFeeBPS: fees?.bonusFeeBPS ? BigInt(fees.bonusFeeBPS) : 5000n,
      penalty,
    });
    console.timeEnd("payerMap");

    console.time("senders");
    const senders = [...new Set(calls.map((call) => call.get().from).filter((i) => typeof i === "string"))] as string[];
    console.timeEnd("senders");

    console.time("preparePaymentPerPayerResult");
    const result = preparePaymentPerPayerResult({
      payerMap,
      senders,
      ethPriceInKIRO,
    });
    console.timeEnd("preparePaymentPerPayerResult");

    return result;
  };

  public getPaymentPerSender = this.getPaymentPerPayer;

  public getMaxGas = () => {
    const allPayers = this.getPaymentPerSender({ ethPriceInKIRO: "0" });

    return allPayers.reduce((acc, payer) => {
      const largestGas = payer.largestPayment.gas;
      if (BigInt(largestGas) > BigInt(acc)) {
        return largestGas;
      }
      return acc;
    }, "0" as string);
  };

  public getCallResults = async ({
    rpcUrl,
    provider,
    txHash,
  }: {
    rpcUrl?: string;
    provider?: ethers.providers.JsonRpcProvider | ethers.providers.Web3Provider;
    txHash: string;
  }) => {
    if (!provider && !rpcUrl) {
      throw new Error("Either provider or rpcUrl is required");
    }
    if (!provider) {
      provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    }
    const txReceipt = await provider.getTransactionReceipt(txHash);
    const Version = getVersionClass(this.FCT);
    const batchMultiSigInterface = Version.Utils.getBatchMultiSigCallABI();

    verifyMessageHash(txReceipt.logs, this.getMessageHash());

    const mapLog = (log: ethers.providers.Log) => {
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
        } catch (e) {
          return false;
        }
      })
      .map(mapLog);

    const failedCalls = txReceipt.logs
      .filter((log) => {
        try {
          return batchMultiSigInterface.parseLog(log).name === "FCTE_CallFailed";
        } catch (e) {
          return false;
        }
      })
      .map(mapLog);

    const callResultConstants = {
      success: "SUCCESS",
      failed: "FAILED",
      skipped: "SKIPPED",
    } as const;

    const manageResult = (index: string) => {
      if (successCalls.find((successCall) => successCall.callIndex === index)) return callResultConstants.success;
      if (failedCalls.find((failedCall) => failedCall.callIndex === index)) return callResultConstants.failed;
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

  public getTransactionTrace = async ({
    txHash,
    tenderlyRpcUrl,
    tries = 3,
  }: {
    txHash: string;
    tenderlyRpcUrl: string;
    tries?: number;
  }) => {
    const provider = new ethers.providers.JsonRpcProvider(tenderlyRpcUrl);
    do {
      try {
        const data = await provider.send("tenderly_traceTransaction", [txHash]);
        if (!data?.trace || !data?.logs) {
          throw new Error("Tenderly trace is not working");
        }

        const executedCalls = executedCallsFromLogs(data.logs, this.getMessageHash());

        const FCT_BatchMultiSigAddress = addresses[+this.FCT.chainId].FCT_BatchMultiSig;

        const traceData = getTraceData({
          FCT_BatchMultiSigAddress,
          calls: this.FCT.calls,
          callsFromTenderlyTrace: getCallsFromTrace(data.trace),
          executedCalls,
          computedVariables: this.FCT.computed,
        });

        return traceData;
      } catch (e) {
        if (tries > 0) {
          await new Promise((resolve) => setTimeout(resolve, 3000));
        } else {
          throw e;
        }
      }
    } while (tries-- > 0);
  };

  public getSimpleTransactionTrace = async ({ txHash, rpcUrl }: { txHash: string; rpcUrl: string }) => {
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    const txReceipt = await provider.getTransactionReceipt(txHash);

    verifyMessageHash(txReceipt.logs, this.getMessageHash());
    const executedCalls = executedCallsFromRawLogs(txReceipt.logs, this.getMessageHash());
    const fctCalls = this.FCT.calls;
    const allFCTComputed = this.FCT.computed;

    return executedCalls.reduce(
      (acc, executedCall) => {
        const fctCall = fctCalls[Number(executedCall.callIndex) - 1];

        acc.calls = [
          ...acc.calls,
          {
            isSuccess: executedCall.isSuccess,
            id: fctCall.nodeId,
          },
        ];

        manageValidationAndComputed(acc, fctCall, allFCTComputed);

        return acc;
      },
      {
        calls: [],
        validations: [],
        computed: [],
      } as ISimpleTxTrace,
    ) as ISimpleTxTrace;
  };

  usesExternalVariables() {
    // External Variables can be in 3 places:
    // - calls
    // - computed variables
    // - validations
    let result = false;
    if (!result) {
      result = this.FCT.calls.some((call) => {
        return call.isExternalVariableUsed();
      });
    }
    if (!result) {
      result = this.FCT.variables.isExternalVariableUsed();
    }
    if (!result) {
      result = this.FCT.validation.isExternalVariableUsed();
    }
    return result;
  }
}
