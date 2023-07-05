import { SignatureLike } from "@ethersproject/bytes";
import { recoverTypedSignature, SignTypedDataVersion, TypedDataUtils, TypedMessage } from "@metamask/eth-sig-util";
import { ethers, utils } from "ethers";
import { Graph } from "graphlib";
import _ from "lodash";

import { Interfaces } from "../../../helpers/Interfaces";
import { BatchMultiSigCall } from "../../batchMultiSigCall";
import { TypedDataLimits, TypedDataTypes } from "../../types";
import { getAuthenticatorSignature, getCalldataForActuator } from "../../utils";
import { getAllRequiredApprovals } from "../../utils/getAllRequiredApprovals";
import { CallID } from "../CallID";
import { EIP712 } from "../EIP712";
import { FCTBase } from "../FCTBase";
import { SessionID } from "../SessionID";
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
      signedFCT: _.merge({}, this.FCTData, { signatures }),
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

  public getOptions() {
    const parsedSessionID = SessionID.asOptions({
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

  public getMessageHash(): string {
    return ethers.utils.hexlify(
      TypedDataUtils.eip712Hash(
        this.FCTData.typedData as unknown as TypedMessage<TypedDataTypes>,
        SignTypedDataVersion.V4
      )
    );
  }

  public isValid(softValidation = false): boolean | Error {
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

  // public isValidNotification(): boolean | Error {
  //   // Check every call, that callId.payerIndex is 0 after decoding
  //   const calls = this.FCT.calls;
  //   for (const call of calls) {
  //     if (call.options.payerIndex !== 0) {
  //       throw new Error(`CallID.payerIndex must be 0 for notification`);
  //     }
  //   }
  //
  //   return true;
  // }

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

    for (let i = 0; i < FCT.mcall.length - 1; i++) {
      const callID = CallID.parseWithNumbers(FCT.mcall[i].callId);
      const jumpOnSuccess = callID.options.jumpOnSuccess;
      const jumpOnFail = callID.options.jumpOnFail;

      if (jumpOnSuccess === jumpOnFail) {
        g.setEdge(i.toString(), (i + 1 + Number(jumpOnSuccess)).toString());
      } else {
        g.setEdge(i.toString(), (i + 1 + Number(jumpOnSuccess)).toString());
        g.setEdge(i.toString(), (i + 1 + Number(jumpOnFail)).toString());
      }
    }

    const allPaths: string[][] = [];

    // const isVisited: Record<string, boolean> = {};
    const pathList: string[] = [];
    const start = "0";
    const end = (FCT.mcall.length - 1).toString();

    pathList.push(start);

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

    return allPaths;
  }

  // TODO: Make this function deprecated. Use getPaymentPerPayer instead
  public getKIROPayment = ({
    priceOfETHInKiro,
    gasPrice,
    gas,
  }: {
    priceOfETHInKiro: string;
    gasPrice: number;
    gas: number;
  }) => {
    const fct = this.FCTData;
    const vault = fct.typedData.message["transaction_1"].call.from;

    const gasInt = BigInt(gas);
    const gasPriceFormatted = BigInt(gasPrice);

    const limits = fct.typedData.message.limits;
    const maxGasPrice = limits.gas_price_limit;

    // 1000 - baseFee
    // 5000 - bonusFee

    const effectiveGasPrice =
      (gasPriceFormatted * BigInt(10000 + 1000) + (BigInt(maxGasPrice) - gasPriceFormatted) * BigInt(5000)) /
      BigInt(10000);

    const feeGasCost = gasInt * (effectiveGasPrice - gasPriceFormatted);
    const baseGasCost = gasInt * gasPriceFormatted;

    const totalCost = baseGasCost + feeGasCost;

    const normalisedPriceOfETHInKiro = BigInt(priceOfETHInKiro);
    const kiroCost = (totalCost * normalisedPriceOfETHInKiro) / BigInt(1e18);

    return {
      vault,
      amountInKIRO: kiroCost.toString(),
      amountInETH: totalCost.toString(),
    };
  };

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
      })
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
      })
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
        calldata,
        calls: fct.mcall,
        pathIndexes: path,
      });

      return payers.reduce((acc, payer) => {
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
      }, {} as Record<string, PayerPayment>);
    });

    const allPayers = [
      ...new Set(
        fct.mcall.map((call) => {
          const { payerIndex } = CallID.parse(call.callId);
          if (payerIndex === 0) return ethers.constants.AddressZero;
          return fct.mcall[payerIndex - 1].from;
        })
      ),
    ];

    return allPayers.map((payer) => {
      const { largest, smallest } = data.reduce((acc, pathData) => {
        const currentValues = acc;
        const currentLargestValue = currentValues.largest?.kiroCost || 0n;
        const currentSmallestValue = currentValues.smallest?.kiroCost;

        const value = pathData[payer as keyof typeof pathData]?.kiroCost || 0n;
        if (value > currentLargestValue) {
          currentValues.largest = pathData[payer as keyof typeof pathData];
        }
        if (!currentSmallestValue || value < currentSmallestValue) {
          currentValues.smallest = pathData[payer as keyof typeof pathData];
        }
        return currentValues;
      }, {} as { largest: PayerPayment; smallest: PayerPayment });

      return {
        payer,
        largestPayment: {
          gas: largest.gas.toString(),
          amount: largest.kiroCost.toString(),
          amountInETH: largest.ethCost.toString(),
        },
        smallestPayment: {
          gas: smallest.gas.toString(),
          amount: smallest.kiroCost.toString(),
          amountInETH: smallest.ethCost.toString(),
        },
      };
    });
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

  private validateFCTKeys(keys: string[]) {
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
