import { IFCT, Param } from "..";
import { BatchMultiSigCall } from "../batchMultiSigCall";
import { EIP712 } from "../batchMultiSigCall/classes";
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
  1: "0xE6CbF811b2D5673Af0A4D8531BF8E21e32D87675",
  42161: "0xeE8c78e0c33D0A0860cCbb4e188AFa8312d49e5b",
  10: "0x6370AFC753a41cD50e83f3A940521A57D4002b09",
  8453: "0x4fF4C72506f7E3630b81c619435250bD8aB6c03c",
  11155111: "0xdDFE0b8dF3cA09bABBa20e2D7D1Cdf43eFDf605f",
};

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
    sender,
  }: {
    multiCallV2Address?: string;
    sender: string;
  }): Promise<IFCT> {
    const typedData = new EIP712(this._FCT).getTypedData();

    sender = sender.toLowerCase();

    const calls = this._FCT.calls;
    const preparedCalls = calls.map((call, i) => call.getAsMCall(typedData, i));

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
        data: call.data,
      };
    });

    const NewFCT = new BatchMultiSigCall({
      chainId: this._FCT.chainId,
      options: this._FCT.options,
    });

    const FCTCallData = {
      from: sender,
      to: multiCallV2Address ?? FCT_Lib_MultiCallV2_addresses[+this._FCT.chainId],
      toENS: "@lib:multicallv2",
      method: "multiCallFlowControlled",
      options: {
        callType: "LIBRARY",
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
                value: processCallData(call.data),
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

    return NewFCT.export();
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

function processCallData(data: string): string {
  let processedData = "0x";
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
    } else if (inAddressSlotBack || inBytes32SlotBack) {
      if (inAddressSlotBack) {
        // 0x000000000000000000000000FDB0000000000000000000000000000000000000
        const address = chunk.slice(24);
        processedData += (BackMulticallOutputVariableBaseAddress.slice(2, 4) + address.slice(2)).padStart(64, "0");
      } else {
        // 0xFDB0000000000000000000000000000000000000000000000000010000000000
        processedData += BackMulticallOutputVariableBaseBytes32.slice(2, 4) + chunk.slice(2);
      }
    } else {
      processedData += chunk;
    }
  }
  return processedData;
}
