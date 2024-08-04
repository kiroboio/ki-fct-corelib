import { ethers } from "ethers";

import { IFCT, Param } from "..";
import { BatchMultiSigCall } from "../batchMultiSigCall";
import { EIP712 } from "../batchMultiSigCall/classes";
import { CallId_020201 } from "../batchMultiSigCall/versions/v020201/CallId";
import { flowsHashes } from "../constants/flows";

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

// const IFCT_Lib_MultiCallV2 = new ethers.utils.Interface(FCT_Lib_MultiCallV2_ABI);
const FCT_Lib_MultiCall_callTypes = {
  ACTION: ethers.utils.id("action"),
  VIEW_ONLY: ethers.utils.id("view only"),
  LIBRARY_VIEW_ONLY: ethers.utils.id("view only"),
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

  public async exportFCTAsMulticallFCT({
    multiCallV2Address,
    sender,
  }: {
    multiCallV2Address?: string;
    sender: string;
  }): Promise<IFCT | Error> {
    // calls struct
    //   struct CallWithFlow {
    //     address target;
    //     bytes32 callType;
    //     uint256 value;
    //     bytes32 method;
    //     bytes32 flow;
    //     bool falseMeansFail;
    //     uint256 jumpOnSuccess;
    //     uint256 jumpOnFail;
    //     uint256 varArgsStart;
    //     uint256 varArgsStop;
    //     bytes data;
    // }
    //
    // function multiCallFlowControlled(
    //    CallWithFlow[] calldata calls,
    //    uint256 first,
    //    uint256 last,
    //    bool dryrun
    // ) external returns (bytes memory returnedData) {
    //
    //
    //
    // @todo steps
    // 1. Take all the calls and convert them to CallWithFlow
    // 2. Take all the computed and validations and convert them to bytes32
    // 3. Take all the calls and convert them to bytes
    // 4. Take all the calls and convert them to bytes

    const typedData = new EIP712(this._FCT).getTypedData();

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

      const decodedCallId = new CallId_020201(this._FCT).parseWithNumbers(call.callId);
      return {
        target: call.to,
        callType: callType,
        value: call.value,
        method: call.functionSignature,
        flow: flowsHashes[Call.options.flow],
        falseMeansFail: Call.options.falseMeansFail,
        jumpOnSuccess: decodedCallId.options.jumpOnSuccess.toString(),
        jumpOnFail: decodedCallId.options.jumpOnFail.toString(),
        varArgsStart: decodedCallId.variableArgsStart.toString(),
        varArgsStop: decodedCallId.variableArgsEnd.toString(),
        data: call.data,
      };
    });

    console.log("callsWithFlow", JSON.stringify(callsWithFlow, null, 2));

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
              },
              {
                name: "flow",
                type: "bytes32",
                value: call.flow,
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

    console.log("FCTCallData", JSON.stringify(FCTCallData, null, 2));

    await NewFCT.add(FCTCallData as any);

    return NewFCT.export();
  }
}
