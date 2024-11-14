import { ethers, IFCT } from "..";
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
  callType: number;
  value: string;
  method: string;
  flow: number;
  falseMeansFail: boolean;
  jumpOnSuccess: number;
  jumpOnFail: number;
  varArgsStart: number;
  varArgsStop: number;
  data: string;
}

// function multiCallFlowControlledOptimized(
//     CallWithFlowOptimized[] calldata calls,
//     uint256 first,
//     uint256 last,
//     bool dryrun
// ) external returns (bytes memory returnedData) {

// struct CallWithFlowOptimized {
//     address target;
//     uint256 meta;
//     bytes data;
// }
//
// function multiCallFlowControlledOptimized(
//     CallWithFlowOptimized[] calldata calls,
//     uint256 first,
//     uint256 last,
//     bool dryrun
// ) external returns (bytes memory returnedData) {

const IMulticallV2 = new ethers.utils.Interface([
  "function multiCallFlowControlledOptimized(tuple(address target,uint256 meta,bytes data)[] calls,uint256 first,uint256 last,bool dryrun) external returns (bytes memory returnedData)",
]);

const FCT_Lib_MultiCall_callTypes = {
  ACTION: 0,
  VIEW_ONLY: 1,
};

const FCT_Lib_MultiCallV2_addresses = {
  1: "0x37b43a3236ee500718728d4caB3457E9b05bcCC3",
  42161: "0xB14471893a9692658c24AA754f710CC430438683",
  10: "0x64754348Aa0fb27Cce9c40214e240755bBBcb265",
  8453: "0x85ac36C32014A000c6301BF69e1c56cd58db2310",
  11155111: "0xB14471893a9692658c24AA754f710CC430438683",
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
      const callType = FCT_Lib_MultiCall_callTypes[options.callType] as number | undefined;

      // Check if it is even possible to create a valid multicall
      if (options.usePureMethod === true) {
        throw new Error(`Call ${i} - pure methods are not allowed ("magic" value)`);
      }
      if (callType === undefined) {
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
        method: Call.getFunctionSignature(),
        flow: +flows[Call.options.flow].value,
        falseMeansFail: Call.options.falseMeansFail,
        jumpOnSuccess: decodedCallId.options.jumpOnSuccess,
        jumpOnFail: decodedCallId.options.jumpOnFail,
        varArgsStart: variableArgsStart,
        varArgsStop: variableArgsEnd,
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
      method: "multiCallFlowControlledOptimizedExec",
      options: {
        callType: "LIBRARY",
        gasLimit: totalGasLimit.toString(),
      },
      params: [
        {
          name: "data",
          type: "bytes",
          value: buildFCTCallData(callsWithFlow, "1", calls.length.toString(), false),
        },
        // {
        //   name: "calls",
        //   type: "tuple[]",
        //   customType: true,
        //   value: callsWithFlow.map((call) => {
        //     return [
        //       {
        //         name: "target",
        //         type: "address",
        //         value: call.target,
        //       },
        //       {
        //         name: "meta",
        //         type: "uint256",
        //         value: buildMeta(call),
        //       },
        //       {
        //         name: "data",
        //         type: "bytes",
        //         value: call.data,
        //       },
        //     ] as Param[];
        //   }),
        // },
        // {
        //   name: "first",
        //   type: "uint256",
        //   value: "1",
        // },
        // {
        //   name: "last",
        //   type: "uint256",
        //   value: calls.length.toString(),
        // },
        // {
        //   name: "dryrun",
        //   type: "bool",
        //   value: false,
        // },
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

function buildFCTCallData(calls: CallWithFlow[], first: string, last: string, dryrun: boolean): string {
  const calldata = IMulticallV2.encodeFunctionData("multiCallFlowControlledOptimized", [
    calls.map((call) => [call.target, buildMeta(call), call.data]),
    first,
    last,
    dryrun,
  ]);
  return calldata;
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

function buildMeta(call: CallWithFlow): string {
  // /** @dev we used a parameter called callId to hold the following info: */
  // uint256 constant CALL_TYPE_BIT = 0; // 0-8  8bit call type
  // uint256 constant VALUE_BIT = 8; // 8-104  96bit gas limit
  // uint256 constant OK_JUMP_BIT = 104; // 104-120  16bit jump on success
  // uint256 constant FAIL_JUMP_BIT = 120; // 120-136  16bit jump on fail
  // uint256 constant FLOW_BIT = 136; // 136-144  8bit flow
  // uint256 constant VAR_ARGS_START_BIT = 144; // 144-176  32bit permissions
  // uint256 constant VAR_ARGS_END_BIT = 176; // 176-208  32bit permissions
  // uint256 constant FALSE_MEANS_FAIL_BIT = 208; // 208-216  8bit false means fail
  // uint256 constant METHOD_SIG_BIT = 224; // 224-256  32bit method signature
  // Value max = 79228162514.26434

  // Call type        - 2
  // Value            - 24
  // Ok Jump          - 4
  // Fail Jump        - 4
  // Flow             - 2
  // Var args start   - 8
  // Var args end     - 8
  // False means fail - 2
  // Method signature - 8

  // Method     / EMPTY / False = fail / Var args end / Var args start / Flow / Fail Jump / Success Jump / Value                    / Call Type
  // 0x00000000 / 00    / 00           / 00000000     / 00000000       / 00   / 0000      / 0000         / 000000000000000000000000 / 00
  // 0x70a08231 / 00    / 00           / 00000000     / 00000000       / 00   / 0000      / 0000         / 000000000000000000000000 / 01

  const start = "0x";
  const method = call.method.slice(2, 10);
  const EMPTY = "00";
  const falseMeansFail = call.falseMeansFail ? "01" : "00";
  const varArgsEnd = call.varArgsStop.toString(16).padStart(8, "0");
  const varArgsStart = call.varArgsStart.toString(16).padStart(8, "0");
  const flow = call.flow.toString(16).padStart(2, "0");
  const failJump = call.jumpOnFail.toString(16).padStart(4, "0");
  const successJump = call.jumpOnSuccess.toString(16).padStart(4, "0");
  const value = BigInt(call.value).toString(16).padStart(24, "0");
  const callType = call.callType.toString(16).padStart(2, "0");

  return [
    start,
    method,
    EMPTY,
    falseMeansFail,
    varArgsEnd,
    varArgsStart,
    flow,
    failJump,
    successJump,
    value,
    callType,
  ].join("");
}
