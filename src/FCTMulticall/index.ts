import { IFCT, Param } from "..";
import { BatchMultiSigCall } from "../batchMultiSigCall";
import { Call, EIP712 } from "../batchMultiSigCall/classes";
import { CallId_020201 } from "../batchMultiSigCall/versions/v020201/CallId";
import {
  BackMulticallOutputVariableBaseAddress,
  BackMulticallOutputVariableBaseBytes32,
  MaxBackOutputVariableAddress,
  MaxBackOutputVariableBytes32,
  MaxOutputVariableAddress,
  MaxOutputVariableBytes32,
  MulticallOutputVariableBaseAddress,
  MulticallOutputVariableBaseBytes32,
  OutputVariableBaseAddress,
  OutputVariableBaseBytes32,
} from "../constants";
import { flows } from "../constants/flows";

interface CallWithFlow {
  target: string;
  callType: string;
  value: string;
  method: string;
  flow: string;
  falseMeansFail: boolean;
  jumpOnSuccess: string;
  jumpOnFail: string;
  varArgsStart: string;
  varArgsStop: string;
  data: string;
}

const FCT_Lib_MultiCall_callTypes = {
  ACTION: "action",
  VIEW_ONLY: "view only",
  LIBRARY_VIEW_ONLY: "view only",
};

const FCT_Lib_MultiCallV2_addresses = {
  1: "0x37b43a3236ee500718728d4caB3457E9b05bcCC3",
  42161: "0xB14471893a9692658c24AA754f710CC430438683",
  10: "0x64754348Aa0fb27Cce9c40214e240755bBBcb265",
  8453: "0x85ac36C32014A000c6301BF69e1c56cd58db2310",
  11155111: "0x1cE596386A12098EE687954b7BFe43898C2821F6",
};

// Overhead for a call without variables: 631 gas before +:
// - if continue on success: 1500 gas
// - if continue on fail: 2500 gas
// - if stop on success: 3500 gas
// - if stop on fail: 4500 gas
// - if revert on success: 3200 gas
// - if revert on fail: 1500 gas
// Check per one slot in calldata: ~ 1100 gas (actual change seems cost around 500 gas)

export class FCTMulticall {
  private readonly _FCT: BatchMultiSigCall;

  constructor(FCT: BatchMultiSigCall) {
    this._FCT = FCT;
  }

  /**
   * Compress the whole FCT into one multicall
   * @note Function will throw an error if it is not possible
   */
  public async compressFCTInMulticall({
    multiCallV2Address,
    multiCallV2ENS = "@lib:multicall_v2",
    sender,
    strictGasLimits,
  }: {
    multiCallV2Address?: string;
    multiCallV2ENS?: string;
    sender: string;
    strictGasLimits?: boolean;
  }): Promise<IFCT> {
    const typedData = new EIP712(this._FCT).getTypedData();

    sender = sender.toLowerCase();

    const calls = this._FCT.calls;
    const preparedCalls = calls.map((call, i) => call.getAsMCall(typedData, i));

    let totalGasLimit = 0n;

    const callsWithFlow: CallWithFlow[] = preparedCalls.map((call, i) => {
      const Call = calls[i];

      const options = Call.options;
      const callType = FCT_Lib_MultiCall_callTypes[options.callType];

      // Check if it is even possible to create a valid multicall
      if (options.usePureMethod === true) {
        throw new Error(`Call ${i} - pure methods are not allowed ("magic" value)`);
      }
      if (!callType) {
        throw new Error(`Call ${i} - delegate call type is not supported`);
      }
      if (call.from.toLowerCase() !== sender) {
        throw new Error(`Call ${i} - there can only be one sender per multicall`);
      }

      const decodedCallId = new CallId_020201(this._FCT).parseWithNumbers(call.callId);
      const variableArgsStart = Number("0x" + decodedCallId.variableArgsStart);
      const variableArgsEnd = Number("0x" + decodedCallId.variableArgsEnd);

      const { data, slotsChanged, totalSlots } = processCallData(call.data);

      totalGasLimit += this.calculateGasPerCall({
        call: Call,
        slotsChanged,
        totalSlots,
        varArgsStart: variableArgsStart,
        varArgsEnd: variableArgsEnd,
      });

      return {
        target: call.to,
        callType: callType,
        value: call.value,
        method: Call.getFunction(),
        flow: flows[Call.options.flow].text,
        falseMeansFail: Call.options.falseMeansFail,
        jumpOnSuccess: decodedCallId.options.jumpOnSuccess.toString(),
        jumpOnFail: decodedCallId.options.jumpOnFail.toString(),
        varArgsStart: variableArgsStart.toString(),
        varArgsStop: variableArgsEnd.toString(),
        data,
      };
    });

    const FCTConstructor: any = {
      chainId: this._FCT.chainId,
      options: this._FCT.options,
      domain: this._FCT.domain,
    };

    if (FCTConstructor.domain === null) {
      delete FCTConstructor.domain;
    }

    const NewFCT = new BatchMultiSigCall(FCTConstructor);

    const FCTCallData = {
      from: sender,
      to: multiCallV2Address ?? FCT_Lib_MultiCallV2_addresses[+this._FCT.chainId],
      toENS: multiCallV2ENS,
      method: "multiCallFlowControlled",
      options: {
        callType: "LIBRARY",
        gasLimit: totalGasLimit.toString(),
      },
      params: [
        {
          name: "calls",
          type: "tuple[]",
          customType: true,
          value: callsWithFlow.map((call) => {
            return [
              {
                name: "target",
                type: "address",
                value: call.target,
              },
              {
                name: "callType",
                type: "bytes32",
                value: call.callType,
                messageType: "string",
              },
              {
                name: "value",
                type: "uint256",
                value: call.value,
              },
              {
                name: "method",
                type: "bytes32",
                value: call.method,
                messageType: "string",
              },
              {
                name: "flow",
                type: "bytes32",
                value: call.flow,
                messageType: "string",
              },
              {
                name: "falseMeansFail",
                type: "bool",
                value: call.falseMeansFail,
              },
              {
                name: "jumpOnSuccess",
                type: "uint256",
                value: call.jumpOnSuccess,
              },
              {
                name: "jumpOnFail",
                type: "uint256",
                value: call.jumpOnFail,
              },
              {
                name: "varArgsStart",
                type: "uint256",
                value: call.varArgsStart,
              },
              {
                name: "varArgsStop",
                type: "uint256",
                value: call.varArgsStop,
              },
              {
                name: "data",
                type: "bytes",
                value: call.data,
              },
            ] as Param[];
          }),
        },
        {
          name: "first",
          type: "uint256",
          value: "1",
        },
        {
          name: "last",
          type: "uint256",
          value: calls.length.toString(),
        },
        {
          name: "dryrun",
          type: "bool",
          value: false,
        },
      ],
    };

    await NewFCT.add(FCTCallData as any);

    return NewFCT.export({ strictGasLimits });
  }

  calculateGasPerCall({
    call,
    slotsChanged,
    totalSlots,
    varArgsStart,
    varArgsEnd,
  }: {
    call: Call;
    slotsChanged: number;
    totalSlots: number;
    varArgsStart: number;
    varArgsEnd: number;
  }): bigint {
    const overheadCost = 70n + 2500n;
    const costPerSlotCheck = 1300n;
    const costPerSlotChange = 650n;
    // Overhead for a call without variables: 631 gas before +:
    // - if continue on success: 1500 gas
    // - if continue on fail: 2500 gas
    // - if stop on success: 3500 gas
    // - if stop on fail: 4500 gas
    // - if revert on success: 3200 gas
    // - if revert on fail: 1500 gas
    // Check per one slot in calldata: ~ 1100 gas (actual change seems cost around 500 gas)

    // We start with regular overhead cost
    let totalGasLimit = overheadCost;

    // Add gas limit for the call
    totalGasLimit += BigInt(call.options.gasLimit === "0" ? "50000" : call.options.gasLimit);

    const varArgsEndInSlots = Math.floor(varArgsEnd / 64);
    const slotsChecked = Math.min(varArgsEndInSlots, totalSlots) - varArgsStart;
    if (slotsChecked > 0) {
      totalGasLimit += BigInt(slotsChecked) * costPerSlotCheck;
    }
    if (slotsChanged > 0) {
      totalGasLimit += BigInt(slotsChanged) * costPerSlotChange;
    }

    return totalGasLimit;
  }

  /**
   * Compress the whole FCT into one multicall
   * @note Function will throw an error if it is not possible
   */
  static async compressFCTInMulticall({
    FCT,
    sender,
    multiCallV2Address,
    multiCallV2ENS,
    strictGasLimits,
  }: {
    FCT: BatchMultiSigCall;
    sender: string;
    multiCallV2Address?: string;
    multiCallV2ENS?: string;
    strictGasLimits?: boolean;
  }): Promise<IFCT> {
    return await new FCTMulticall(FCT).compressFCTInMulticall({
      sender,
      multiCallV2Address,
      multiCallV2ENS,
      strictGasLimits,
    });
  }
}

const OutputVariableBaseAddressBN = BigInt(OutputVariableBaseAddress);
const MaxOutputVariableAddressBN = BigInt(MaxOutputVariableAddress);
const OutputVariableBaseBytes32BN = BigInt(OutputVariableBaseBytes32);
const MaxOutputVariableBytes32BN = BigInt(MaxOutputVariableBytes32);

const BackOutputVariableBaseAddressBN = BigInt(BackMulticallOutputVariableBaseAddress);
const MaxBackOutputVariableAddressBN = BigInt(MaxBackOutputVariableAddress);
const BackOutputVariableBaseBytes32BN = BigInt(BackMulticallOutputVariableBaseBytes32);
const MaxBackOutputVariableBytes32BN = BigInt(MaxBackOutputVariableBytes32);

function processCallData(data: string): { data: string; slotsChanged: number; totalSlots: number } {
  let processedData = "0x";
  let slotsChanged = 0;
  let totalSlots = 0;
  for (let i = 2; i < data.length; i += 64) {
    const chunk = data.slice(i, i + 64);
    const chunkBN = BigInt("0x" + chunk);
    const addressBN = BigInt("0x" + chunk.slice(24));

    const inAddressSlot = addressBN >= OutputVariableBaseAddressBN && addressBN <= MaxOutputVariableAddressBN;
    const inBytes32Slot = chunkBN >= OutputVariableBaseBytes32BN && chunkBN <= MaxOutputVariableBytes32BN;

    const inAddressSlotBack =
      addressBN >= BackOutputVariableBaseAddressBN && addressBN <= MaxBackOutputVariableAddressBN;
    const inBytes32SlotBack = chunkBN >= BackOutputVariableBaseBytes32BN && chunkBN <= MaxBackOutputVariableBytes32BN;

    if (inAddressSlot || inBytes32Slot) {
      if (inAddressSlot) {
        // 0x000000000000000000000000FD00000000000000000000000000000000000000
        const address = chunk.slice(24);
        processedData += (MulticallOutputVariableBaseAddress.slice(2, 4) + address.slice(2)).padStart(64, "0");
      } else {
        // 0xFD00000000000000000000000000000000000000000000000000010000000000
        processedData += MulticallOutputVariableBaseBytes32.slice(2, 4) + chunk.slice(2);
      }
      slotsChanged++;
    } else if (inAddressSlotBack || inBytes32SlotBack) {
      if (inAddressSlotBack) {
        // 0x000000000000000000000000FDB0000000000000000000000000000000000000
        const address = chunk.slice(24);
        processedData += (BackMulticallOutputVariableBaseAddress.slice(2, 4) + address.slice(2)).padStart(64, "0");
      } else {
        // 0xFDB0000000000000000000000000000000000000000000000000010000000000
        processedData += BackMulticallOutputVariableBaseBytes32.slice(2, 4) + chunk.slice(2);
      }
      slotsChanged++;
    } else {
      processedData += chunk;
    }
    totalSlots++;
  }

  return {
    data: processedData,
    slotsChanged,
    totalSlots,
  };
}
