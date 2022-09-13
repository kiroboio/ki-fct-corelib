import { utils } from "ethers";
import { TypedData } from "ethers-eip712";
import { MSCallOptions } from "./interfaces";
import {
  flows,
  getEncodedMethodParams,
  getMethodInterface,
  getTypedHashes,
  getTypesArray,
  getValidatorData,
  getValidatorMethodInterface,
} from "../helpers";
import { MSCallInput } from "./interfaces";
import { Flow } from "../constants";

const nullValue = "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470";

export const handleMethodInterface = (call: MSCallInput): string => {
  // If call is not a ETH transfer
  if (call.method) {
    // If call is a validation call
    if (call.validator) {
      return getValidatorMethodInterface(call.validator);
    }

    // Else it's a standard method interface
    return getMethodInterface(call);
  }

  // Else it's a ETH transfer
  return "";
};

export const handleFunctionSignature = (call: MSCallInput) => {
  if (call.method) {
    const value = call.validator ? getValidatorMethodInterface(call.validator) : getMethodInterface(call);
    return utils.id(value);
  }
  return nullValue;
};

export const handleEnsHash = (call: MSCallInput) => {
  if (call.toENS) {
    return utils.id(call.toENS);
  }
  return nullValue;
};

export const handleData = (call: MSCallInput) => {
  if (call.validator) {
    return getValidatorData(call, true);
  }

  return getEncodedMethodParams(call);
};

export const handleTypes = (call: MSCallInput) => {
  if (call.params) {
    return getTypesArray(call.params);
  }
  return [];
};

export const handleTypedHashes = (call: MSCallInput, typedData: TypedData) => {
  if (call.params) {
    return getTypedHashes(call.params, typedData);
  }
  return [];
};

export const manageFlow = (call: MSCallInput) => {
  // const jump = (call.options && call.options.jump) || 0;
  const jump = 0;
  const flow = (call.options && call.options.flow) || "OK_CONT_FAIL_REVERT";

  if (jump > 15) {
    throw new Error("Jump value cannot exceed 15");
  }

  if (!flows[flow]) {
    throw new Error("Flow not found");
  }

  return `0x${flows[flow].value}${jump.toString(16)}`;
};

export const manageCallId = (call: MSCallInput, index: number) => {
  // 4 - Permissions
  // 2 - Flow
  // 4 - Fail Jump
  // 4 - Ok Jump
  // 4 - Payer index
  // 4 - Call index
  // 8 - Gas limit
  // 2 - Flags

  const permissions = "0000";
  const flow = call?.options?.flow ? Number(flows[call.options.flow].value).toString(16).padStart(1, "00") : "00";
  const failJump = call?.options?.jumpOnFail ? Number(call.options.jumpOnFail).toString(16).padStart(4, "0") : "0000";
  const successJump = call?.options?.jumpOnSuccess
    ? Number(call.options.jumpOnSuccess).toString(16).padStart(4, "0")
    : "0000";
  const payerIndex = Number(index).toString(16).padStart(4, "0");
  const callIndex = Number(index).toString(16).padStart(4, "0");
  const gasLimit = call?.options?.gasLimit ? Number(call.options.gasLimit).toString(16).padStart(8, "0") : "00000000";
  const flags = `0${call.viewOnly ? "1" : "0"}`;

  return (
    "0x" +
    `${permissions}${flow}${failJump}${successJump}${payerIndex}${callIndex}${gasLimit}${flags}`.padStart(64, "0")
  );
};

export const getSessionId = (salt: string, options: MSCallOptions) => {
  // 6 - Salt
  // 2 - External signers
  // 6 - Version
  // 4 - Max Repeats
  // 8 - Chill time
  // 10 - After timestamp
  // 10 - Before timestamp
  // 16 - Gas price limit
  // 2 - Flags

  const minimumApprovals = options.multisig ? options.multisig.minimumApprovals.toString(16).padStart(2, "0") : "00";
  const version = "010101";
  const maxRepeats = options.recurrency ? Number(options.recurrency.maxRepeats).toString(16).padStart(4, "0") : "0000";
  const chillTime = options.recurrency
    ? Number(options.recurrency.chillTime).toString(16).padStart(8, "0")
    : "00000000";
  const beforeTimestamp = options.expiresAt ? Number(options.expiresAt).toString(16).padStart(10, "0") : "ffffffffff"; // TODO: Date right now + 30 days
  const afterTimestamp = options.validFrom ? Number(options.validFrom).toString(16).padStart(10, "0") : "0000000000"; // TODO: Date right now
  const maxGasPrice = options.maxGasPrice
    ? Number(options.maxGasPrice).toString(16).padStart(16, "0")
    : "00000005D21DBA00"; // 25 Gwei

  let flagValue = 8; // EIP712 true by default
  if (options.recurrency?.accumetable) flagValue += 1;
  if (options.purgeable) flagValue += 2;
  if (options.cancelable) flagValue += 4;

  const flags = flagValue.toString(16).padStart(2, "0");

  return `0x${salt}${minimumApprovals}${version}${maxRepeats}${chillTime}${beforeTimestamp}${afterTimestamp}${maxGasPrice}${flags}`;
};

export const parseSessionID = (sessionId: string, builder: string): MSCallOptions => {
  // const salt = sessionId.slice(2, 8);
  const minimumApprovals = parseInt(sessionId.slice(8, 10), 16);
  // const version = sessionId.slice(10, 16);
  const maxRepeats = parseInt(sessionId.slice(16, 20), 16);
  const chillTime = parseInt(sessionId.slice(20, 28), 16);
  const expiresAt = parseInt(sessionId.slice(28, 38), 16).toString();
  const validFrom = parseInt(sessionId.slice(38, 48), 16).toString();
  const maxGasPrice = parseInt(sessionId.slice(48, 64), 16).toString();
  const flagsNumber = parseInt(sessionId.slice(64, 66), 16);

  let flags = {
    eip712: true,
    accumetable: false,
    purgeable: false,
    cancelable: false,
  };

  if (flagsNumber === 9) {
    flags = {
      ...flags,
      accumetable: true,
    };
  } else if (flagsNumber === 10) {
    flags = {
      ...flags,
      purgeable: true,
    };
  } else if (flagsNumber === 11) {
    flags = {
      ...flags,
      accumetable: true,
      purgeable: true,
    };
  } else if (flagsNumber === 12) {
    flags = {
      ...flags,
      cancelable: true,
    };
  } else if (flagsNumber === 13) {
    flags = {
      ...flags,
      accumetable: true,
      cancelable: true,
    };
  } else if (flagsNumber === 14) {
    flags = {
      ...flags,
      purgeable: true,
      cancelable: true,
    };
  } else if (flagsNumber === 15) {
    flags = {
      ...flags,
      accumetable: true,
      purgeable: true,
      cancelable: true,
    };
  }

  const data = {
    validFrom,
    expiresAt,
    maxGasPrice,
    cancelable: flags.cancelable,
    purgeable: flags.purgeable,
  };

  return {
    ...data,
    builder,
    recurrency: {
      accumetable: flags.accumetable,
      chillTime,
      maxRepeats,
    },
    multisig: {
      minimumApprovals,
    },
  };
};

export const parseCallID = (
  callId: string
): {
  options: {
    gasLimit: number;
    flow: Flow;
    jumpOnSuccess: number;
    jumpOnFail: number;
  };
  viewOnly: boolean;
  permissions: string;
  payerIndex: number;
  callIndex: number;
} => {
  const permissions = callId.slice(2, 6);
  const flowNumber = parseInt(callId.slice(6, 8), 16);
  const jumpOnFail = parseInt(callId.slice(8, 12), 16);
  const jumpOnSuccess = parseInt(callId.slice(12, 16), 16);
  const payerIndex = parseInt(callId.slice(16, 20), 16);
  const callIndex = parseInt(callId.slice(20, 24), 16);
  const gasLimit = parseInt(callId.slice(24, 32), 16);
  const flags = parseInt(callId.slice(32, 34), 16);

  const getFlow = () => {
    const flow = Object.entries(flows).find(([, value]) => {
      return value.value === flowNumber.toString();
    });
    return Flow[flow[0]];
  };

  return {
    options: {
      flow: getFlow(),
      jumpOnFail,
      jumpOnSuccess,
      gasLimit,
    },
    viewOnly: flags === 1,
    permissions,
    payerIndex,
    callIndex,
  };
};
