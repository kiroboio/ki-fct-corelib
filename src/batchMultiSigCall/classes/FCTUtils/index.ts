import { SignatureLike } from "@ethersproject/bytes";
import { recoverTypedSignature, SignTypedDataVersion, TypedDataUtils, TypedMessage } from "@metamask/eth-sig-util";
import { ethers, utils } from "ethers";
import { Graph } from "graphlib";
import NodeCache from "node-cache";

import { Flow } from "../../../constants";
import { InstanceOf } from "../../../helpers";
import { deepMerge } from "../../../helpers/deepMerge";
import { Interfaces } from "../../../helpers/Interfaces";
import { BatchMultiSigCall } from "../../batchMultiSigCall";
import { TypedDataLimits, TypedDataTypes } from "../../types";
import { getAuthenticatorSignature, getCalldataForActuator } from "../../utils";
import { getAllRequiredApprovals } from "../../utils/getAllRequiredApprovals";
import { CallID } from "../CallID";
import { EIP712 } from "../EIP712";
import { FCTBase } from "../FCTBase";
import { secureStorageAddresses } from "./constants";
import { getCostInKiro, getEffectiveGasPrice, getPayersForRoute } from "./getPaymentPerPayer";
import { executedCallsFromLogs, manageValidationAndComputed, verifyMessageHash } from "./helpers";
import { ISimpleTxTrace, ITxTrace, PayerPayment } from "./types";

export class FCTUtils extends FCTBase {
  private _eip712: EIP712;
  private _cache = new NodeCache();

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
    purgedFCT,
    investor,
    activator,
  }: {
    signatures: SignatureLike[];
    purgedFCT: string;
    investor: string;
    activator: string;
  }) {
    return getCalldataForActuator({
      signedFCT: deepMerge(this.FCTData, { signatures }),
      purgedFCT,
      investor,
      activator,
      version: this.FCT.version.slice(2),
    });
  }

  public getAuthenticatorSignature(): SignatureLike {
    return getAuthenticatorSignature(this._eip712.getTypedData());
  }

  public recoverAddress(signature: SignatureLike): string | null {
    try {
      const signatureString = utils.joinSignature(signature);
      return recoverTypedSignature<SignTypedDataVersion.V4, TypedDataTypes>({
        data: this.FCTData.typedData as unknown as TypedMessage<TypedDataTypes>,
        version: SignTypedDataVersion.V4,
        signature: signatureString,
      });
    } catch (e) {
      return null;
    }
  }

  public getMessageHash(): string {
    return ethers.utils.hexlify(
      TypedDataUtils.eip712Hash(
        this.FCTData.typedData as unknown as TypedMessage<TypedDataTypes>,
        SignTypedDataVersion.V4,
      ),
    );
  }

  public isValid(softValidation = false): boolean | Error {
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

  public getSigners(): string[] {
    return this.FCTData.mcall.reduce((acc: string[], { from }) => {
      // Check if the address is already in the accumulator
      // And it is not an address from secureStorageAddresses. If it is, we dont
      // want to add it to the signers array
      const doNotReturn = secureStorageAddresses.find(
        (address) => address.address.toLowerCase() === from.toLowerCase() && address.chainId === this.FCT.chainId,
      );

      if (!acc.includes(from) && !doNotReturn) {
        acc.push(from);
      }
      return acc;
    }, []);
  }

  public getAllPaths(): string[][] {
    const FCT = this.FCTData;
    const g = new Graph({ directed: true });

    FCT.mcall.forEach((_, index) => {
      g.setNode(index.toString());
    });

    const continueOnSuccessFlows = [Flow.OK_CONT_FAIL_REVERT, Flow.OK_CONT_FAIL_STOP, Flow.OK_CONT_FAIL_CONT];
    const continueOnFailFlows = [Flow.OK_REVERT_FAIL_CONT, Flow.OK_STOP_FAIL_CONT, Flow.OK_CONT_FAIL_CONT];
    const endFlows = [
      Flow.OK_STOP_FAIL_STOP,
      Flow.OK_STOP_FAIL_REVERT,
      Flow.OK_REVERT_FAIL_STOP,
      Flow.OK_CONT_FAIL_STOP,
      Flow.OK_STOP_FAIL_CONT,
    ];
    const dontAddEdge = [Flow.OK_STOP_FAIL_STOP, Flow.OK_STOP_FAIL_REVERT, Flow.OK_REVERT_FAIL_STOP];

    const ends = [(FCT.mcall.length - 1).toString()];

    for (let i = 0; i < FCT.mcall.length - 1; i++) {
      const callID = CallID.parseWithNumbers(FCT.mcall[i].callId);
      const flow = callID.options.flow;
      const jumpOnSuccess = callID.options.jumpOnSuccess;
      const jumpOnFail = callID.options.jumpOnFail;

      if (jumpOnSuccess === jumpOnFail) {
        if (dontAddEdge.includes(flow)) continue;
        g.setEdge(i.toString(), (i + 1 + +jumpOnSuccess).toString());
      } else {
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
    const allPaths: string[][] = [];
    const pathList: string[] = [start];

    const uniqueEnds = Array.from(new Set(ends));
    for (const end of uniqueEnds) {
      const printAllPathsUtil = (g: Graph, start: string, end: string, localPathList: string[]) => {
        if (start === end) {
          const path = localPathList.slice();
          allPaths.push(path);
          return;
        }

        let successors = g.successors(start);
        if (successors === undefined) {
          successors = [];
        }

        for (const id of successors as string[]) {
          localPathList.push(id);
          printAllPathsUtil(g, id, end, localPathList);
          localPathList.splice(localPathList.indexOf(id), 1);
        }
      };

      printAllPathsUtil(g, start, end, pathList);
    }

    return allPaths;
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
    const maxGasPrice = BigInt(limits.gas_price_limit);

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
    const baseFeeBPS = fees?.baseFeeBPS ? BigInt(fees.baseFeeBPS) : 1000n;
    const bonusFeeBPS = fees?.bonusFeeBPS ? BigInt(fees.bonusFeeBPS) : 5000n;

    const fct = this.FCTData;

    const allPathsKey = JSON.stringify(fct);
    let allPaths = this._cache.get(allPathsKey) as ReturnType<this["getAllPaths"]>;

    if (!allPaths) {
      allPaths = this.getAllPaths() as ReturnType<this["getAllPaths"]>;
      this._cache.set(allPathsKey, allPaths);
    }

    const limits = fct.typedData.message.limits as TypedDataLimits;

    maxGasPrice = maxGasPrice ? BigInt(maxGasPrice) : BigInt(limits.gas_price_limit);
    const txGasPrice = gasPrice ? BigInt(gasPrice) : maxGasPrice;
    const effectiveGasPrice = BigInt(
      getEffectiveGasPrice({
        gasPrice: txGasPrice,
        maxGasPrice,
        baseFeeBPS,
        bonusFeeBPS,
      }),
    );
    fct.signatures = signatures || [];

    const calldata = this.getCalldataForActuator({
      activator: "0x0000000000000000000000000000000000000000",
      investor: "0x0000000000000000000000000000000000000000",
      purgedFCT: "0x".padEnd(66, "0"),
      signatures: fct.signatures,
    });

    const data = allPaths.map((path) => {
      const payers = getPayersForRoute({
        chainId: this.FCT.chainId,
        calldata,
        calls: fct.mcall,
        pathIndexes: path,
      });

      return payers.reduce(
        (acc, payer) => {
          const base = payer.gas * txGasPrice;
          const fee = payer.gas * (effectiveGasPrice - txGasPrice);
          const ethCost = base + fee;

          return {
            ...acc,
            [payer.payer]: {
              ...payer,
              pureEthCost: ethCost,
              ethCost: (ethCost * BigInt(penalty || 10_000)) / 10_000n,
            },
          };
        },
        {} as Record<string, PayerPayment>,
      );
    });

    const allPayers = [
      ...new Set(
        fct.mcall.map((call) => {
          const { payerIndex } = CallID.parse(call.callId);
          if (payerIndex === 0) return ethers.constants.AddressZero;
          const payer = fct.mcall[payerIndex - 1].from;
          return payer;
        }),
      ),
    ];

    return allPayers.map((payer) => {
      const { largest, smallest } = data.reduce(
        (acc, pathData) => {
          const currentValues = acc;
          const currentLargestValue = currentValues.largest?.ethCost || 0n;
          const currentSmallestValue = currentValues.smallest?.ethCost;

          const value = pathData[payer as keyof typeof pathData]?.pureEthCost || 0n;
          if (!currentLargestValue || value > currentLargestValue) {
            currentValues.largest = pathData[payer as keyof typeof pathData];
          }
          if (!currentSmallestValue || value < currentSmallestValue) {
            currentValues.smallest = pathData[payer as keyof typeof pathData];
          }
          return currentValues;
        },
        {} as { largest: PayerPayment; smallest: PayerPayment },
      );

      const largestKiroCost = getCostInKiro({ ethPriceInKIRO, ethCost: largest.pureEthCost });
      const smallestKiroCost = getCostInKiro({ ethPriceInKIRO, ethCost: smallest.pureEthCost });

      return {
        payer,
        largestPayment: {
          gas: largest.gas.toString(),
          tokenAmountInWei: largestKiroCost,
          nativeAmountInWei: largest.ethCost.toString(),
          tokenAmount: utils.formatEther(largestKiroCost),
          nativeAmount: utils.formatEther(largest.ethCost.toString()),
        },
        smallestPayment: {
          gas: smallest.gas.toString(),
          tokenAmountInWei: smallestKiroCost,
          nativeAmountInWei: smallest.ethCost.toString(),
          tokenAmount: utils.formatEther(smallestKiroCost),
          nativeAmount: utils.formatEther(smallest.ethCost.toString()),
        },
      };
    });
  };

  public getMaxGas = () => {
    const allPayers = this.getPaymentPerPayer({ ethPriceInKIRO: "0" });

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
    const batchMultiSigInterface = Interfaces.FCT_BatchMultiSigCall;

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
    let keepTrying = true;
    do {
      try {
        // throw new Error("Tenderly trace is not working");
        const data = await provider.send("tenderly_traceTransaction", [txHash]);
        if (!data || !data.trace || !data.logs) {
          throw new Error("Tenderly trace is not working");
        }
        const rawLogs = data.logs.map((log) => log.raw);
        verifyMessageHash(rawLogs, this.getMessageHash());
        const executedCalls = executedCallsFromLogs(rawLogs);

        const callsFromTenderlyTrace = data.trace.filter((call) => {
          return (
            call.traceAddress.length === 7 &&
            call.traceAddress[0] === 0 &&
            call.traceAddress[1] === 0 &&
            call.traceAddress[3] === 0 &&
            call.traceAddress[4] === 0 &&
            call.traceAddress[5] === 2 &&
            call.traceAddress[6] === 2
          );
        });

        const fctCalls = this.FCT.calls;
        const allFCTComputed = this.FCT.computed;

        const traceData = executedCalls.reduce(
          (acc, executedCall, index) => {
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

            manageValidationAndComputed(acc, fctCall, allFCTComputed);

            return acc;
          },
          {
            calls: [],
            validations: [],
            computed: [],
          } as ITxTrace,
        ) as ITxTrace;

        keepTrying = false;

        return traceData;
      } catch (e) {
        if (tries > 0) {
          await new Promise((resolve) => setTimeout(resolve, 3000));
        } else {
          throw e;
        }
      }
    } while (keepTrying && tries-- > 0);
  };

  public getSimpleTransactionTrace = async ({ txHash, rpcUrl }: { txHash: string; rpcUrl: string }) => {
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    const txReceipt = await provider.getTransactionReceipt(txHash);

    verifyMessageHash(txReceipt.logs, this.getMessageHash());
    const executedCalls = executedCallsFromLogs(txReceipt.logs);
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

  private _validateFCTKeys(keys: string[]) {
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
