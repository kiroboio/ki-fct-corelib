import { SignatureLike } from "@ethersproject/bytes";
import { ChainId, getPlugin } from "@kirobo/ki-eth-fct-provider-ts";
import { recoverTypedSignature, SignTypedDataVersion, TypedDataUtils, TypedMessage } from "@metamask/eth-sig-util";
import BigNumber from "bignumber.js";
import { ethers, utils } from "ethers";
import { Graph } from "graphlib";
import _ from "lodash";

import { Interface } from "../../../helpers/Interfaces";
import { BatchMultiSigCall } from "../../batchMultiSigCall";
import { addresses } from "../../constants";
import { TypedDataLimits, TypedDataTypes } from "../../types";
import { getAuthenticatorSignature, getCalldataForActuator } from "../../utils";
import { getAllRequiredApprovals } from "../../utils/getAllRequiredApprovals";
import { CallID } from "../CallID";
import { EIP712 } from "../EIP712";
import { FCTBase } from "../FCTBase";
import { SessionID } from "../SessionID";

export class FCTUtils extends FCTBase {
  private _eip712: EIP712;
  constructor(FCT: BatchMultiSigCall) {
    super(FCT);
    this._eip712 = new EIP712(FCT);
  }

  private get FCTData() {
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
  }): string {
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
      //   const callID = parseCallID(fct.mcall[i].callId, true);
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

    const isVisited: Record<string, boolean> = {};
    const pathList: string[] = [];
    const start = "0";
    const end = (FCT.mcall.length - 1).toString();

    pathList.push(start);

    const printAllPathsUtil = (
      g: Graph,
      start: string,
      end: string,
      isVisited: Record<string, boolean>,
      localPathList: string[]
    ) => {
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

      for (const id of successors as string[]) {
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

  public async estimateFCTCost({ callData, rpcUrl }: { callData: string; rpcUrl: string }) {
    const fct = this.FCTData;
    const chainId = Number(this.FCT.chainId);

    const FCTOverhead = 135500;
    const callOverhead = 16370;
    const numOfCalls = fct.mcall.length;
    const actuator = Interface.FCT_Actuator;

    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    const batchMultiSigCallContract = new ethers.Contract(
      addresses[chainId as keyof typeof addresses].FCT_BatchMultiSig,
      Interface.FCT_BatchMultiSigCall,
      provider
    );

    const calcMemory = (input: number) => {
      return input * 3 + (input * input) / 512;
    };

    const callDataString = callData.slice(2);
    const callDataArray = callDataString.split("");
    const totalCallDataCost = callDataArray.reduce((accumulator, item) => {
      if (item === "0") return accumulator + 4;
      return accumulator + 16;
    }, 21000);

    const nonZero = callDataArray.reduce((accumulator, item) => {
      if (item !== "0") return accumulator + 1;
      return accumulator + 0;
    }, 0);

    const dataLength =
      actuator.encodeFunctionData("activate", [callData, "0x0000000000000000000000000000000000000000"]).length / 2;

    let totalCallGas = new BigNumber(0);
    for (const call of fct.mcall) {
      if (call.types.length > 0) {
        const gasForCall = await batchMultiSigCallContract.estimateGas.abiToEIP712(
          call.data,
          call.types,
          call.typedHashes,
          { data: 0, types: 0 }
        );

        const pluginData = getPlugin({
          address: call.to,
          chainId: chainId.toString() as ChainId,
          signature: call.functionSignature,
        });

        if (pluginData) {
          const gasLimit = new pluginData.plugin({ chainId: chainId.toString() as ChainId }).gasLimit;

          if (gasLimit) {
            totalCallGas = totalCallGas.plus(gasLimit);
          }
        }

        totalCallGas = totalCallGas.plus(gasForCall.toString());
      }
    }

    const gasEstimation = new BigNumber(FCTOverhead)
      .plus(new BigNumber(callOverhead).times(numOfCalls))
      .plus(totalCallDataCost)
      .plus(calcMemory(dataLength))
      .minus(calcMemory(nonZero))
      .plus(new BigNumber(dataLength).times(600).div(32))
      .plus(totalCallGas);

    return gasEstimation.toString();
  }

  // 38270821632831754769812 - kiro price
  // 1275004198 - max fee
  // 462109 - gas
  // TODO: Make this function deprecated. Use getPaymentPerPayer instead
  public getKIROPayment = ({
    kiroPriceInETH,
    gasPrice,
    gas,
  }: {
    kiroPriceInETH: string;
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

    const normalisedKiroPriceInETH = BigInt(kiroPriceInETH);
    const kiroCost = Number(totalCost * normalisedKiroPriceInETH) / 1e36;
    const amountInETH = Number(totalCost) / 1e18;

    return {
      vault,
      amountInKIRO: kiroCost.toString(),
      amountInETH: amountInETH.toString(),
    };
  };

  public getPaymentPerPayer = ({
    signatures,
    gasPrice,
    kiroPriceInETH,
    penalty,
  }: {
    signatures?: SignatureLike[];
    gasPrice?: number;
    kiroPriceInETH: string;
    penalty?: number;
  }) => {
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

    const limits = fct.typedData.message.limits as TypedDataLimits;
    const maxGasPrice = limits.gas_price_limit;

    const FCTgasPrice = gasPrice ? gasPrice.toString() : maxGasPrice;
    const bigIntGasPrice = BigInt(FCTgasPrice);

    const effectiveGasPrice = (
      (bigIntGasPrice * BigInt(10000 + 1000) + (BigInt(maxGasPrice) - bigIntGasPrice) * BigInt(5000)) / BigInt(10000) -
      bigIntGasPrice
    ).toString();

    const data = allPaths.map((path) => {
      const FCTOverheadPerPayer = (FCTOverhead / path.length).toFixed(0);

      return path.reduce((acc, callIndex) => {
        const call = fct.mcall[Number(callIndex)];
        const callId = CallID.parse(call.callId);
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
          [payer]: (BigInt(acc[payer as keyof typeof acc] || 0) + kiroCost).toString(),
        };
      }, {});
    });

    const allPayers = [
      ...new Set(
        fct.mcall.map((call) => {
          const callId = CallID.parse(call.callId);
          const payerIndex = callId.payerIndex;
          const payer = fct.mcall[payerIndex - 1].from;
          return payer;
        })
      ),
    ];

    return allPayers.map((payer) => {
      const amount = data.reduce<string>((acc: string, path) => {
        return BigInt(acc) > BigInt(path[payer as keyof typeof path] || "0")
          ? acc
          : path[payer as keyof typeof path] || "0";
      }, "0");

      return {
        payer,
        amount,
        amountInETH: (((BigInt(amount) * BigInt(1e18)) / BigInt(kiroPriceInETH)) * BigInt(penalty || 1)).toString(),
      };
    });
  };

  public getGasPerPayer = (fctInputData?: { signatures?: SignatureLike[] }) => {
    const fct = this.FCTData;
    const allPaths = this.getAllPaths();

    fct.signatures = fctInputData?.signatures || [];

    const callData = this.getCalldataForActuator({
      activator: "0x0000000000000000000000000000000000000000",
      investor: "0x0000000000000000000000000000000000000000",
      purgedFCT: "0x".padEnd(66, "0"),
      signatures: fct.signatures,
    });

    const FCTOverhead = 35000 + 8500 * (fct.mcall.length + 1) + (79000 * callData.length) / 10000 + 135500;
    const callOverhead = 16370;
    const defaultCallGas = 50000;

    const limits = fct.typedData.message.limits as TypedDataLimits;
    const maxGasPrice = limits.gas_price_limit;

    const FCTgasPrice = maxGasPrice;
    const bigIntGasPrice = BigInt(FCTgasPrice);

    const effectiveGasPrice = (
      (bigIntGasPrice * BigInt(10000 + 1000) + (BigInt(maxGasPrice) - bigIntGasPrice) * BigInt(5000)) / BigInt(10000) -
      bigIntGasPrice
    ).toString();

    const data = allPaths.map((path) => {
      const FCTOverheadPerPayer = (FCTOverhead / path.length).toFixed(0);

      return path.reduce((acc, callIndex) => {
        const call = fct.mcall[Number(callIndex)];
        const callId = CallID.parse(call.callId);
        const payerIndex = callId.payerIndex;
        const payer = fct.mcall[payerIndex - 1].from;

        // 21000 - base fee of the call on EVMs
        const gasForCall = (BigInt(callId.options.gasLimit) || BigInt(defaultCallGas)) - BigInt(21000);
        const totalGasForCall = BigInt(FCTOverheadPerPayer) + BigInt(callOverhead) + gasForCall;

        const callCost = totalGasForCall * BigInt(FCTgasPrice);
        const callFee = totalGasForCall * BigInt(effectiveGasPrice);
        const totalCallCost = callCost + callFee;

        return {
          ...acc,
          [payer]: (BigInt(acc[payer as keyof typeof acc] || 0) + totalCallCost).toString(),
        };
      }, {});
    });

    const allPayers = [
      ...new Set(
        fct.mcall.map((call) => {
          const callId = CallID.parse(call.callId);
          const payerIndex = callId.payerIndex;
          const payer = fct.mcall[payerIndex - 1].from;
          return payer;
        })
      ),
    ];

    return allPayers.map((payer) => {
      const amount = data.reduce<string>((acc: string, path) => {
        return BigInt(acc) > BigInt(path[payer as keyof typeof path] || "0")
          ? acc
          : path[payer as keyof typeof path] || "0";
      }, "0");

      return {
        payer,
        amount,
      };
    });
  };

  public getExecutedPath = async ({
    //   chainId,
    rpcUrl,
    txHash,
  }: {
    //   chainId: string | number;
    rpcUrl: string;
    txHash: string;
  }) => {
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);

    // Get the tx receipt
    const txReceipt = await provider.getTransactionReceipt(txHash);
    const batchMultiSigInterface = Interface.FCT_BatchMultiSigCall;
    const controllerInterface = Interface.FCT_Controller;

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

    const logs = txReceipt.logs
      .filter((log) => {
        try {
          return batchMultiSigInterface.parseLog(log).name === "FCTE_CallSucceed";
        } catch (e) {
          return false;
        }
      })
      .map((log) => {
        const parsedLog = batchMultiSigInterface.parseLog(log);
        // Return args
        return {
          id: parsedLog.args.id,
          caller: parsedLog.args.caller,
          callIndex: parsedLog.args.callIndex.toString(),
        };
      });

    return logs;
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
