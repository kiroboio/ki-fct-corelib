import { CALL_TYPE, Flow } from "../../../constants";
import { flows } from "../../../constants/flows";
import { Call, Validation } from "../../classes";
import { NO_JUMP } from "../../constants";
import { CallIdBase } from "../bases/CallIdBase";

const valueWithPadStart = (value: string | number, padStart: number) => {
  return Number(value).toString(16).padStart(padStart, "0");
};

// This is the structure of callId string
// 4 - Validation
// 4 - Permissions
// 2 - Flow
// 4 - Fail Jump
// 4 - Ok Jump
// 4 - Payer index
// 4 - Call index
// 8 - Gas limit
// 2 - Flags
//                                / Val  / Parm / Fl / Fail / Ok   / Payr / Call / Gas lmt  / Flags
// 0x0000000000000000000000000000 / 0000 / 0000 / 05 / 0000 / 0001 / 0001 / 0001 / 00000000 / 00;

export class CallId_oldVersion extends CallIdBase {
  public asString({
    calls,
    validation,
    call,
    index,
    payerIndex,
  }: {
    calls: Call[];
    validation: Validation;
    call: Call;
    index: number;
    payerIndex?: number;
  }): string {
    const permissions = "0000";
    const validationIndex = valueWithPadStart(
      call.options.validation ? validation.getIndex(call.options.validation) : 0,
      4,
    );
    const flow = valueWithPadStart(flows[call.options.flow].value, 2);
    const payerIndexHex = valueWithPadStart(typeof payerIndex === "number" ? payerIndex : index + 1, 4);
    const callIndex = valueWithPadStart(index + 1, 4);
    const gasLimit = valueWithPadStart(call.options.gasLimit, 8);

    const flags = () => {
      const callType = CALL_TYPE[call.options.callType];
      const falseMeansFail = call.options.falseMeansFail ? 4 : 0;

      return callType + (parseInt(callType, 16) + falseMeansFail).toString(16);
    };

    let successJump = "0000";
    let failJump = "0000";

    if (call.options) {
      const { jumpOnFail, jumpOnSuccess } = call.options;
      if (jumpOnFail && jumpOnFail !== NO_JUMP) {
        const nodeIndex = calls.findIndex((c) => c.nodeId === call?.options?.jumpOnFail);

        failJump = Number(nodeIndex - index - 1)
          .toString(16)
          .padStart(4, "0");
      }

      if (jumpOnSuccess && jumpOnSuccess !== NO_JUMP) {
        const nodeIndex = calls.findIndex((c) => c.nodeId === call?.options?.jumpOnSuccess);

        successJump = Number(nodeIndex - index - 1)
          .toString(16)
          .padStart(4, "0");
      }
    }

    return (
      "0x" +
      `${validationIndex}${permissions}${flow}${failJump}${successJump}${payerIndexHex}${callIndex}${gasLimit}${flags()}`.padStart(
        64,
        "0",
      )
    );
  }

  public parse(callId: string): {
    options: {
      gasLimit: string;
      flow: Flow;
      jumpOnSuccess: string;
      jumpOnFail: string;
      validation: string;
    };
    viewOnly: boolean;
    permissions: string;
    payerIndex: number;
    callIndex: number;
  } {
    const { validation, permissions, flowNumber, jumpOnFail, jumpOnSuccess, payerIndex, callIndex, gasLimit, flags } =
      this.destructCallId(callId);

    const options = {
      gasLimit,
      flow: this.getFlow(flowNumber),
      jumpOnFail: "",
      jumpOnSuccess: "",
      validation: validation.toString(),
    };

    if (jumpOnFail) options["jumpOnFail"] = `node${callIndex + jumpOnFail}`;
    if (jumpOnSuccess) options["jumpOnSuccess"] = `node${callIndex + jumpOnFail}`;

    return {
      options,
      viewOnly: flags === 1,
      permissions,
      payerIndex,
      callIndex,
    };
  }

  public parseWithNumbers(callId: string): {
    options: {
      gasLimit: string;
      flow: Flow;
      jumpOnSuccess: number;
      jumpOnFail: number;
      validation: number;
    };
    viewOnly: boolean;
    permissions: string;
    payerIndex: number;
    callIndex: number;
  } {
    const { validation, permissions, flowNumber, jumpOnFail, jumpOnSuccess, payerIndex, callIndex, gasLimit, flags } =
      this.destructCallId(callId);

    const options = {
      gasLimit,
      flow: this.getFlow(flowNumber),
      jumpOnFail,
      jumpOnSuccess,
      validation,
    };

    return {
      options,
      viewOnly: flags === 1,
      permissions,
      payerIndex,
      callIndex,
    };
  }

  protected destructCallId = (callId: string) => {
    const validation = parseInt(callId.slice(34, 36), 16);
    const permissions = callId.slice(36, 38);
    const flowNumber = parseInt(callId.slice(38, 40), 16);
    const jumpOnFail = parseInt(callId.slice(40, 44), 16);
    const jumpOnSuccess = parseInt(callId.slice(44, 48), 16);
    const payerIndex = parseInt(callId.slice(48, 52), 16);
    const callIndex = parseInt(callId.slice(52, 56), 16);
    const gasLimit = parseInt(callId.slice(56, 64), 16).toString();
    const flags = parseInt(callId.slice(64, 66), 16);

    return {
      validation,
      permissions,
      flowNumber,
      jumpOnFail,
      jumpOnSuccess,
      payerIndex,
      callIndex,
      gasLimit,
      flags,
    };
  };

  protected getFlow = (flowNumber: number) => {
    const flow = Object.entries(flows).find(([, value]) => {
      return value.value === flowNumber.toString();
    });
    if (!flow) throw new Error("Invalid flow");
    return Flow[flow[0] as keyof typeof Flow];
  };
}
