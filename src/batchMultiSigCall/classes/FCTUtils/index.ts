import { SignatureLike } from "@ethersproject/bytes";
import { recoverTypedSignature, SignTypedDataVersion, TypedDataUtils, TypedMessage } from "@metamask/eth-sig-util";
import { ethers, utils } from "ethers";
import { Graph } from "graphlib";

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
import { getEffectiveGasPrice, getPayersForRoute } from "./getPaymentPerPayer";
import { PayerPayment } from "./types";

export class FCTUtils extends FCTBase {
  private _eip712: EIP712;
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
    this.validateFCTKeys(keys);

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
      if (!acc.includes(from)) {
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
    // const end = (FCT.mcall.length - 1).toString();
    // pathList.push(start);

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

      // printAllPathsUtil(g, start, end, isVisited, pathList);
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
    const allPaths = this.getAllPaths();

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

          const kiroCost = (ethCost * BigInt(ethPriceInKIRO)) / 10n ** 18n;
          return {
            ...acc,
            [payer.payer]: {
              ...payer,
              ethCost: (ethCost * BigInt(penalty || 10_000)) / 10_000n,
              kiroCost,
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
          const currentLargestValue = currentValues.largest?.kiroCost || 0n;
          const currentSmallestValue = currentValues.smallest?.kiroCost;

          const value = pathData[payer as keyof typeof pathData]?.kiroCost || 0n;
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

      return {
        payer,
        largestPayment: {
          gas: largest.gas.toString(),
          tokenAmountInWei: largest.kiroCost.toString(),
          nativeAmountInWei: largest.ethCost.toString(),
          tokenAmount: utils.formatEther(largest.kiroCost.toString()),
          nativeAmount: utils.formatEther(largest.ethCost.toString()),
        },
        smallestPayment: {
          gas: smallest.gas.toString(),
          tokenAmountInWei: smallest.kiroCost.toString(),
          nativeAmountInWei: smallest.ethCost.toString(),
          tokenAmount: utils.formatEther(smallest.kiroCost.toString()),
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
    const controllerInterface = Interfaces.FCT_Controller;

    // Get FCTE_Activated event
    const messageHash = txReceipt.logs.find((log) => {
      try {
        return controllerInterface.parseLog(log).name === "FCTE_Registered";
      } catch (e) {
        return false;
      }
    })?.topics[2];
    const messageHashUtil = this.getMessageHash();

    if (messageHash !== messageHashUtil) {
      throw new Error("Message hash mismatch");
    }

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

  public getTransactionTrace = async ({ txHash, tenderlyRpcUrl }: { txHash: string; tenderlyRpcUrl: string }) => {
    const provider = new ethers.providers.JsonRpcProvider(tenderlyRpcUrl);

    const data = await provider.send("tenderly_traceTransaction", [txHash]);

    const batchMultiSigInterface = Interfaces.FCT_BatchMultiSigCall;
    const controllerInterface = Interfaces.FCT_Controller;

    // Get FCTE_Activated event
    const messageHash = data.logs.find((log) => {
      try {
        return controllerInterface.parseLog(log.raw).name === "FCTE_Registered";
      } catch (e) {
        return false;
      }
    })?.raw.topics[2];
    const messageHashUtil = this.getMessageHash();

    if (messageHash !== messageHashUtil) {
      throw new Error("Message hash mismatch");
    }

    const mapLog = (log: any) => {
      const parsedLog = batchMultiSigInterface.parseLog(log.raw);
      return {
        id: parsedLog.args.id,
        caller: parsedLog.args.caller,
        callIndex: parsedLog.args.callIndex.toString(),
      };
    };

    const executedCalls = data.logs
      .filter((log) => {
        try {
          return (
            batchMultiSigInterface.parseLog(log.raw).name === "FCTE_CallSucceed" ||
            batchMultiSigInterface.parseLog(log.raw).name === "FCTE_CallFailed"
          );
        } catch (e) {
          return false;
        }
      })
      .map(mapLog);

    const calls = data.trace.filter((call) => {
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

    return executedCalls.reduce((acc, executedCall, index) => {
      const fctCall = fctCalls[Number(executedCall.callIndex) - 1];
      const internalTx = calls[index];
      const input = internalTx.input;

      acc = [
        ...acc,
        {
          inputData: fctCall.decodeData(input),
          error: internalTx.error || undefined,
          type: "CALL",
          id: fctCall.nodeId,
        },
      ];

      // Check if fctCall had a validation
      if (fctCall.options.validation && fctCall.options.validation !== "0") {
        acc = [
          ...acc,
          {
            type: "VALIDATION",
            id: fctCall.options.validation,
          },
        ];
      }

      return acc;
    }, [] as Array<any>);
  };

  private validateFCTKeys(keys: string[]) {
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
