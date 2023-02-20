'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var kiEthFctProviderTs = require('@kirobo/ki-eth-fct-provider-ts');
var ethers = require('ethers');
var ethSigUtil = require('@metamask/eth-sig-util');
var graphlib = require('graphlib');
var BigNumber = require('bignumber.js');
var utils = require('ethers/lib/utils');
var _ = require('lodash');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var BigNumber__default = /*#__PURE__*/_interopDefaultLegacy(BigNumber);
var ___default = /*#__PURE__*/_interopDefaultLegacy(_);

var Flow = /* @__PURE__ */ ((Flow2) => {
  Flow2["OK_CONT_FAIL_REVERT"] = "OK_CONT_FAIL_REVERT";
  Flow2["OK_CONT_FAIL_STOP"] = "OK_CONT_FAIL_STOP";
  Flow2["OK_CONT_FAIL_CONT"] = "OK_CONT_FAIL_CONT";
  Flow2["OK_REVERT_FAIL_CONT"] = "OK_REVERT_FAIL_CONT";
  Flow2["OK_REVERT_FAIL_STOP"] = "OK_REVERT_FAIL_STOP";
  Flow2["OK_STOP_FAIL_CONT"] = "OK_STOP_FAIL_CONT";
  Flow2["OK_STOP_FAIL_REVERT"] = "OK_STOP_FAIL_REVERT";
  Flow2["OK_STOP_FAIL_STOP"] = "OK_STOP_FAIL_STOP";
  return Flow2;
})(Flow || {});
const flows = {
  OK_CONT_FAIL_REVERT: {
    text: "continue on success, revert on fail",
    value: "0"
  },
  OK_CONT_FAIL_STOP: {
    text: "continue on success, stop on fail",
    value: "1"
  },
  OK_CONT_FAIL_CONT: {
    text: "continue on success, continue on fail",
    value: "2"
  },
  OK_REVERT_FAIL_CONT: {
    text: "revert on success, continue on fail",
    value: "3"
  },
  OK_REVERT_FAIL_STOP: {
    text: "revert on success, stop on fail",
    value: "4"
  },
  OK_STOP_FAIL_CONT: {
    text: "stop on success, continue on fail",
    value: "5"
  },
  OK_STOP_FAIL_REVERT: {
    text: "stop on success, revert on fail",
    value: "6"
  },
  OK_STOP_FAIL_STOP: {
    text: "stop on success, stop on fail",
    value: "7"
  }
};

const multicallContracts = {
  1: "0xeefBa1e63905eF1D7ACbA5a8513c70307C1cE441",
  5: "0x77dCa2C955b15e9dE4dbBCf1246B4B85b651e50e"
};
const nullValue = "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470";
const FCBase = "0xFC00000000000000000000000000000000000000";
const FCBaseBytes = "0xFC00000000000000000000000000000000000000000000000000000000000000";
const FDBase = "0xFD00000000000000000000000000000000000000";
const FDBaseBytes = "0xFD00000000000000000000000000000000000000000000000000000000000000";
const FDBackBase = "0xFDB0000000000000000000000000000000000000";
const FDBackBaseBytes = "0xFDB0000000000000000000000000000000000000000000000000000000000000";
const ComputedBase = "0xFE00000000000000000000000000000000000000";
const ComputedBaseBytes = "0xFE00000000000000000000000000000000000000000000000000000000000000";
const CALL_TYPE = {
  ACTION: "0",
  VIEW_ONLY: "1",
  LIBRARY: "2"
};
const CALL_TYPE_MSG = {
  ACTION: "action",
  VIEW_ONLY: "view only",
  LIBRARY: "library"
};
const FCT_VAULT_ADDRESS = "FCT_VAULT_ADDRESS";

var index$5 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  Flow: Flow,
  flows: flows,
  multicallContracts: multicallContracts,
  nullValue: nullValue,
  FCBase: FCBase,
  FCBaseBytes: FCBaseBytes,
  FDBase: FDBase,
  FDBaseBytes: FDBaseBytes,
  FDBackBase: FDBackBase,
  FDBackBaseBytes: FDBackBaseBytes,
  ComputedBase: ComputedBase,
  ComputedBaseBytes: ComputedBaseBytes,
  CALL_TYPE: CALL_TYPE,
  CALL_TYPE_MSG: CALL_TYPE_MSG,
  FCT_VAULT_ADDRESS: FCT_VAULT_ADDRESS
});

const mustBeInteger = ["validFrom", "expiresAt", "maxGasPrice", "maxRepeats", "chillTime", "minimumApprovals"];
const mustBeAddress = ["builder"];
const validateInteger = (value, keys) => {
  const currentKey = keys[keys.length - 1];
  if (value.includes(".")) {
    throw new Error(`Options: ${keys.join(".")} cannot be a decimal`);
  }
  if (value.startsWith("-")) {
    throw new Error(`Options: ${keys.join(".")} cannot be negative`);
  }
  if (currentKey === "maxRepeats" && Number(value) < 1) {
    throw new Error(
      `Options: ${keys.join(
        "."
      )} should be at least 1. If value is 1, recurrency will not be enabled in order to save gas`
    );
  }
};
const validateAddress = (value, keys) => {
  if (!utils.isAddress(value)) {
    throw new Error(`Options: ${keys.join(".")} is not a valid address`);
  }
};
const validateOptionsValues = (value, parentKeys = []) => {
  if (!value) {
    return;
  }
  Object.keys(value).forEach((key) => {
    const objKey = key;
    if (typeof value[objKey] === "object") {
      validateOptionsValues(value[objKey], [...parentKeys, objKey]);
    }
    if (mustBeInteger.includes(objKey)) {
      validateInteger(value[objKey], [...parentKeys, objKey]);
    }
    if (mustBeAddress.includes(objKey)) {
      validateAddress(value[objKey], [...parentKeys, objKey]);
    }
    if (objKey === "expiresAt") {
      const expiresAt = Number(value[objKey]);
      const now = Number((/* @__PURE__ */ new Date()).getTime() / 1e3).toFixed();
      const validFrom = value.validFrom;
      if (BigNumber__default["default"](expiresAt).isLessThanOrEqualTo(now)) {
        throw new Error(`Options: expiresAt must be in the future`);
      }
      if (validFrom && BigNumber__default["default"](expiresAt).isLessThanOrEqualTo(validFrom)) {
        throw new Error(`Options: expiresAt must be greater than validFrom`);
      }
    }
  });
};
const verifyOptions = (options) => {
  validateOptionsValues(options);
};
const verifyParam = (param) => {
  if (!param.value) {
    throw new Error(`Param ${param.name} is missing a value`);
  }
  if (typeof param.value !== "string") {
    return;
  }
  if (param.type.startsWith("uint")) {
    if (param.value.includes(".")) {
      throw new Error(`Param ${param.name} cannot be a decimal`);
    }
    if (param.value.startsWith("-")) {
      throw new Error(`Param ${param.name} cannot be negative`);
    }
  }
  if (param.type.startsWith("int")) {
    if (param.value.includes(".")) {
      throw new Error(`Param ${param.name} cannot be a decimal`);
    }
  }
  if (param.type === "address") {
    if (!utils.isAddress(param.value)) {
      throw new Error(`Param ${param.name} is not a valid address`);
    }
  }
  if (param.type.startsWith("bytes")) {
    if (!param.value.startsWith("0x")) {
      throw new Error(`Param ${param.name} is not a valid bytes value`);
    }
  }
};

const isInstanceOfTupleArray = (value, param) => {
  return (param.customType ?? false) && param.type.lastIndexOf("[") > 0;
};
const isInstanceOfTuple = (value, param) => {
  return (param.customType ?? false) && param.type.lastIndexOf("[") === -1;
};
const getTxEIP712Types = (calls) => {
  const txTypes = {};
  const structTypes = {};
  const getTypeCount = () => Object.values(structTypes).length + 1;
  const getStructType = (param, index) => {
    const typeName = `Struct${getTypeCount()}`;
    let paramValue;
    if (isInstanceOfTupleArray(param.value, param)) {
      paramValue = param.value[0];
    } else if (isInstanceOfTuple(param.value, param)) {
      paramValue = param.value;
    } else {
      throw new Error(`Invalid param value: ${param.value} for param: ${param.name}`);
    }
    let customCount = 0;
    const eip712Type = paramValue.map((item) => {
      if (item.customType || item.type.includes("tuple")) {
        ++customCount;
        const innerTypeName = `Struct${getTypeCount() + customCount}`;
        return {
          name: item.name,
          type: innerTypeName
        };
      }
      return {
        name: item.name,
        type: item.type
      };
    });
    structTypes[typeName] = eip712Type;
    if (param.type.lastIndexOf("[") > 0) {
      for (const parameter of param.value[0]) {
        if (parameter.customType || parameter.type.includes("tuple")) {
          getStructType(parameter);
        }
      }
    } else {
      for (const parameter of param.value) {
        if (parameter.customType || parameter.type.includes("tuple")) {
          getStructType(parameter);
        }
      }
    }
    return typeName;
  };
  calls.forEach((call, index) => {
    const values = call.params ? call.params.map((param) => {
      if (param.customType || param.type === "tuple") {
        const type = getStructType(param);
        return { name: param.name, type };
      }
      return {
        name: param.name,
        type: param.type
      };
    }) : [];
    txTypes[`transaction${index + 1}`] = [{ name: "call", type: "Call" }, ...values];
  });
  return {
    txTypes,
    structTypes
  };
};
const getUsedStructTypes = (typedData, typeName) => {
  const mainType = typedData.types[typeName];
  const usedStructTypes = mainType.reduce((acc, item) => {
    if (item.type.includes("Struct")) {
      return [...acc, item.type, ...getUsedStructTypes(typedData, item.type)];
    }
    return acc;
  }, []);
  return usedStructTypes;
};
const getComputedVariableMessage = (computedVariables) => {
  return computedVariables.reduce((acc, item, i) => {
    return {
      ...acc,
      [`computed_${i + 1}`]: {
        index: (i + 1).toString(),
        var: item.variable,
        add: item.add,
        sub: item.sub,
        mul: item.mul,
        div: item.div
      }
    };
  }, {});
};

const instanceOfVariable = (object) => {
  return typeof object === "object" && "type" in object && "id" in object;
};
function instanceOfParams(objectOrArray) {
  if (Array.isArray(objectOrArray)) {
    return instanceOfParams(objectOrArray[0]);
  }
  return typeof objectOrArray === "object" && "type" in objectOrArray && "name" in objectOrArray;
}

const getMethodInterface = (call) => {
  const getParamsType = (param) => {
    if (instanceOfParams(param.value)) {
      if (Array.isArray(param.value[0])) {
        const value = param.value[0];
        return `(${value.map(getParamsType).join(",")})[]`;
      } else {
        const value = param.value;
        return `(${value.map(getParamsType).join(",")})`;
      }
    }
    return param.hashed ? "bytes32" : param.type;
  };
  const params = call.params ? call.params.map(getParamsType) : "";
  return `${call.method}(${params})`;
};
const getEncodedMethodParams = (call, withFunction) => {
  if (!call.method)
    return "0x";
  if (withFunction) {
    const ABI = [
      `function ${call.method}(${call.params ? call.params.map((item) => item.hashed ? "bytes32" : item.type).join(",") : ""})`
    ];
    const iface = new ethers.utils.Interface(ABI);
    return iface.encodeFunctionData(
      call.method,
      call.params ? call.params.map((item) => {
        if (item.hashed) {
          if (typeof item.value === "string") {
            return ethers.utils.keccak256(utils.toUtf8Bytes(item.value));
          }
          throw new Error("Hashed value must be a string");
        }
        return item.value;
      }) : []
    );
  }
  const getType = (param) => {
    if (param.customType || param.type.includes("tuple")) {
      let value;
      let isArray = false;
      if (param.type.lastIndexOf("[") > 0) {
        isArray = true;
        value = param.value[0];
      } else {
        value = param.value;
      }
      return `(${value.map(getType).join(",")})${isArray ? "[]" : ""}`;
    }
    return param.hashed ? "bytes32" : param.type;
  };
  const getValues = (param) => {
    if (!param.value) {
      throw new Error("Param value is required");
    }
    if (param.customType || param.type.includes("tuple")) {
      let value;
      if (param.type.lastIndexOf("[") > 0) {
        value = param.value;
        return value.reduce((acc, val) => {
          return [...acc, val.map(getValues)];
        }, []);
      } else {
        value = param.value;
        return value.map(getValues);
      }
    }
    if (param.hashed) {
      if (typeof param.value === "string") {
        return ethers.utils.keccak256(utils.toUtf8Bytes(param.value));
      }
      throw new Error("Hashed value must be a string");
    }
    return param.value;
  };
  if (!call.params)
    return "0x";
  return utils.defaultAbiCoder.encode(call.params.map(getType), call.params.map(getValues));
};

function getDate(days = 0) {
  const result = /* @__PURE__ */ new Date();
  result.setDate(result.getDate() + days);
  return Number(result.getTime() / 1e3).toFixed();
}

const TYPE_NATIVE = 1e3;
const TYPE_STRING = 2e3;
const TYPE_BYTES = 3e3;
const TYPE_ARRAY = 4e3;
const TYPE_ARRAY_WITH_LENGTH = 5e3;
const typeValue = (param) => {
  if (param.type.lastIndexOf("[") > 0 && !param.hashed) {
    if (param.customType || param.type.includes("tuple")) {
      const value = param.value;
      return [TYPE_ARRAY, value.length, ...getTypesArray(param.value[0])];
    }
    const parameter = { ...param, type: param.type.slice(0, param.type.lastIndexOf("[")) };
    const insideType = typeValue(parameter);
    const type = param.type.indexOf("]") - param.type.indexOf("[") === 1 ? TYPE_ARRAY : TYPE_ARRAY_WITH_LENGTH;
    return [type, ...insideType];
  }
  if (param.type === "string" && !param.hashed) {
    return [TYPE_STRING];
  }
  if (param.type === "bytes" && !param.hashed) {
    return [TYPE_BYTES];
  }
  if (param.customType || param.type.includes("tuple")) {
    const values = param.value;
    const types = values.reduce((acc, item) => {
      return [...acc, ...typeValue(item)];
    }, []);
    return [values.length, ...types];
  }
  return [TYPE_NATIVE];
};
const getTypesArray = (params) => {
  const types = params.reduce((acc, item) => {
    const data = typeValue(item);
    return [...acc, ...data];
  }, []);
  if (!types.some((item) => item !== TYPE_NATIVE)) {
    return [];
  }
  return types;
};
const getTypedHashes = (params, typedData) => {
  return params.reduce((acc, item) => {
    if (item.customType) {
      const type = item.type.lastIndexOf("[") > 0 ? item.type.slice(0, item.type.lastIndexOf("[")) : item.type;
      return [...acc, ethers.utils.hexlify(ethers.utils.hexlify(ethSigUtil.TypedDataUtils.hashType(type, typedData.types)))];
    }
    return acc;
  }, []);
};

const handleMethodInterface = (call) => {
  if (call.method) {
    return getMethodInterface(call);
  }
  return "";
};
const handleFunctionSignature = (call) => {
  if (call.method) {
    const value = getMethodInterface(call);
    return ethers.utils.id(value);
  }
  return nullValue;
};
const handleEnsHash = (call) => {
  if (call.toENS) {
    return ethers.utils.id(call.toENS);
  }
  return nullValue;
};
const handleData = (call) => {
  return getEncodedMethodParams(call);
};
const handleTypes = (call) => {
  if (call.params) {
    return getTypesArray(call.params);
  }
  return [];
};
const handleTypedHashes = (call, typedData) => {
  if (call.params) {
    return getTypedHashes(call.params, typedData);
  }
  return [];
};

const addresses = {
  1: {
    // NOTE: These addresses are not correct since no contracts have been deployed on mainnet
    // TODO: Update these addresses once contracts have been deployed on mainnet
    FCT_Controller: "0x087550a787B2720AAC06351065afC1F413D82572",
    FCT_BatchMultiSig: "0x067D176d13651c8AfF7964a4bB9dF3107F893e88",
    FCT_EnsManager: "0x7DA33a8606BF2F752D473238ff8681b53cf30976",
    FCT_Tokenomics: "0xFE4fEC781Bd626751249ABb1b15375f3370B9c79",
    Actuator: "0x6B271aEa169B4804D1d709B2687c17c3Cc8E2e56",
    ActuatorCore: "0xC76b674d3e33cd908055F295c945F1cd575b7df2"
  },
  5: {
    FCT_Controller: "0x087550a787B2720AAC06351065afC1F413D82572",
    FCT_BatchMultiSig: "0x067D176d13651c8AfF7964a4bB9dF3107F893e88",
    FCT_EnsManager: "0x7DA33a8606BF2F752D473238ff8681b53cf30976",
    FCT_Tokenomics: "0xFE4fEC781Bd626751249ABb1b15375f3370B9c79",
    Actuator: "0x6B271aEa169B4804D1d709B2687c17c3Cc8E2e56",
    ActuatorCore: "0xC76b674d3e33cd908055F295c945F1cd575b7df2"
  }
};
const EIP712_RECURRENCY = [
  { name: "max_repeats", type: "uint16" },
  { name: "chill_time", type: "uint32" },
  { name: "accumetable", type: "bool" }
];
const EIP712_MULTISIG = [
  { name: "external_signers", type: "address[]" },
  { name: "minimum_approvals", type: "uint8" }
];
const NO_JUMP = "NO_JUMP";
const DEFAULT_CALL_OPTIONS = {
  permissions: "0000",
  gasLimit: "0",
  flow: Flow.OK_CONT_FAIL_REVERT,
  jumpOnSuccess: NO_JUMP,
  jumpOnFail: NO_JUMP,
  falseMeansFail: false,
  callType: "ACTION"
};

const valueWithPadStart = (value, padStart) => {
  return Number(value).toString(16).padStart(padStart, "0");
};
const manageCallId = (calls, call, index) => {
  const permissions = "0000";
  const flow = valueWithPadStart(flows[call.options.flow].value, 2);
  const payerIndex = valueWithPadStart(index + 1, 4);
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
    if (call.options.jumpOnFail !== NO_JUMP) {
      const nodeIndex = calls.findIndex((c) => c.nodeId === call?.options?.jumpOnFail);
      failJump = Number(nodeIndex - index - 1).toString(16).padStart(4, "0");
    }
    if (call.options.jumpOnSuccess !== NO_JUMP) {
      const nodeIndex = calls.findIndex((c) => c.nodeId === call?.options?.jumpOnSuccess);
      successJump = Number(nodeIndex - index - 1).toString(16).padStart(4, "0");
    }
  }
  return "0x" + `${permissions}${flow}${failJump}${successJump}${payerIndex}${callIndex}${gasLimit}${flags()}`.padStart(64, "0");
};
const getSessionId = (salt, versionHex, options) => {
  const currentDate = /* @__PURE__ */ new Date();
  const { recurrency, multisig } = options;
  if (options.expiresAt && Number(options.expiresAt) < currentDate.getTime() / 1e3) {
    throw new Error("Expires at date cannot be in the past");
  }
  const minimumApprovals = multisig.externalSigners.length > 0 ? Number(options.multisig.minimumApprovals).toString(16).padStart(2, "0") : "00";
  const version = versionHex.slice(2);
  const maxRepeats = Number(recurrency.maxRepeats) > 1 ? Number(options.recurrency.maxRepeats).toString(16).padStart(4, "0") : "0000";
  const chillTime = Number(recurrency.maxRepeats) > 0 ? Number(options.recurrency.chillTime).toString(16).padStart(8, "0") : "00000000";
  const beforeTimestamp = Number(options.expiresAt).toString(16).padStart(10, "0");
  const afterTimestamp = Number(options.validFrom).toString(16).padStart(10, "0");
  const maxGasPrice = Number(options.maxGasPrice).toString(16).padStart(16, "0");
  let flagValue = 8;
  if (options.recurrency?.accumetable)
    flagValue += 1;
  if (options.purgeable)
    flagValue += 2;
  if (options.blockable)
    flagValue += 4;
  const flags = flagValue.toString(16).padStart(2, "0");
  return `0x${salt}${minimumApprovals}${version}${maxRepeats}${chillTime}${beforeTimestamp}${afterTimestamp}${maxGasPrice}${flags}`;
};
const parseSessionID = (sessionId, builder) => {
  const minimumApprovals = parseInt(sessionId.slice(8, 10), 16).toString();
  const maxRepeats = parseInt(sessionId.slice(16, 20), 16).toString();
  const chillTime = parseInt(sessionId.slice(20, 28), 16).toString();
  const expiresAt = parseInt(sessionId.slice(28, 38), 16).toString();
  const validFrom = parseInt(sessionId.slice(38, 48), 16).toString();
  const maxGasPrice = parseInt(sessionId.slice(48, 64), 16).toString();
  const flagsNumber = parseInt(sessionId.slice(64, 66), 16);
  let flags = {
    eip712: true,
    accumetable: false,
    purgeable: false,
    blockable: false
  };
  if (flagsNumber === 9) {
    flags = {
      ...flags,
      accumetable: true
    };
  } else if (flagsNumber === 10) {
    flags = {
      ...flags,
      purgeable: true
    };
  } else if (flagsNumber === 11) {
    flags = {
      ...flags,
      accumetable: true,
      purgeable: true
    };
  } else if (flagsNumber === 12) {
    flags = {
      ...flags,
      blockable: true
    };
  } else if (flagsNumber === 13) {
    flags = {
      ...flags,
      accumetable: true,
      blockable: true
    };
  } else if (flagsNumber === 14) {
    flags = {
      ...flags,
      purgeable: true,
      blockable: true
    };
  } else if (flagsNumber === 15) {
    flags = {
      ...flags,
      accumetable: true,
      purgeable: true,
      blockable: true
    };
  }
  const data = {
    validFrom,
    expiresAt,
    maxGasPrice,
    blockable: flags.blockable,
    purgeable: flags.purgeable
  };
  const recurrency = {};
  recurrency.accumetable = flags.accumetable;
  if (maxRepeats !== "0")
    recurrency.maxRepeats = maxRepeats;
  if (chillTime !== "0")
    recurrency.chillTime = chillTime;
  const multisig = {};
  if (minimumApprovals !== "0")
    multisig.minimumApprovals = minimumApprovals;
  return {
    ...data,
    builder,
    recurrency,
    multisig
  };
};
const parseCallID = (callId, jumpsAsNumbers = false) => {
  const permissions = callId.slice(36, 38);
  const flowNumber = parseInt(callId.slice(38, 40), 16);
  const jumpOnFail = parseInt(callId.slice(40, 44), 16);
  const jumpOnSuccess = parseInt(callId.slice(44, 48), 16);
  const payerIndex = parseInt(callId.slice(48, 52), 16);
  const callIndex = parseInt(callId.slice(52, 56), 16);
  const gasLimit = parseInt(callId.slice(56, 64), 16).toString();
  const flags = parseInt(callId.slice(64, 66), 16);
  const getFlow = () => {
    const flow = Object.entries(flows).find(([, value]) => {
      return value.value === flowNumber.toString();
    });
    if (!flow)
      throw new Error("Invalid flow");
    return Flow[flow[0]];
  };
  const options = {
    gasLimit,
    flow: getFlow(),
    jumpOnFail: 0,
    jumpOnSuccess: 0
  };
  if (jumpsAsNumbers) {
    options["jumpOnFail"] = jumpOnFail;
    options["jumpOnSuccess"] = jumpOnSuccess;
  } else {
    if (jumpOnFail)
      options["jumpOnFail"] = `node${callIndex + jumpOnFail}`;
    if (jumpOnSuccess)
      options["jumpOnSuccess"] = `node${callIndex + jumpOnFail}`;
  }
  return {
    options,
    viewOnly: flags === 1,
    permissions,
    payerIndex,
    callIndex
  };
};

var index$4 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  verifyOptions: verifyOptions,
  verifyParam: verifyParam,
  getTxEIP712Types: getTxEIP712Types,
  getUsedStructTypes: getUsedStructTypes,
  getComputedVariableMessage: getComputedVariableMessage,
  handleMethodInterface: handleMethodInterface,
  handleFunctionSignature: handleFunctionSignature,
  handleEnsHash: handleEnsHash,
  handleData: handleData,
  handleTypes: handleTypes,
  handleTypedHashes: handleTypedHashes,
  manageCallId: manageCallId,
  getSessionId: getSessionId,
  parseSessionID: parseSessionID,
  parseCallID: parseCallID
});

function validateFCTKeys(keys) {
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
    "signatures"
  ];
  validKeys.forEach((key) => {
    if (!keys.includes(key)) {
      throw new Error(`FCT missing key ${key}`);
    }
  });
}
const recoverAddressFromEIP712 = (typedData, signature) => {
  try {
    const signatureString = ethers.utils.joinSignature(signature);
    const address = ethSigUtil.recoverTypedSignature({
      data: typedData,
      version: ethSigUtil.SignTypedDataVersion.V4,
      signature: signatureString
    });
    return address;
  } catch (e) {
    return null;
  }
};
const getFCTMessageHash = (typedData) => {
  return ethers.ethers.utils.hexlify(
    ethSigUtil.TypedDataUtils.eip712Hash(typedData, ethSigUtil.SignTypedDataVersion.V4)
  );
};
const validateFCT = (FCT, softValidation = false) => {
  const keys = Object.keys(FCT);
  validateFCTKeys(keys);
  const limits = FCT.typedData.message.limits;
  const fctData = FCT.typedData.message.meta;
  const currentDate = (/* @__PURE__ */ new Date()).getTime() / 1e3;
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
  return {
    getOptions: () => {
      const parsedSessionID = parseSessionID(FCT.sessionId, fctData.builder);
      return {
        valid_from: parsedSessionID.validFrom,
        expires_at: parsedSessionID.expiresAt,
        gas_price_limit: parsedSessionID.maxGasPrice,
        blockable: parsedSessionID.blockable,
        purgeable: parsedSessionID.purgeable,
        builder: parsedSessionID.builder,
        recurrency: parsedSessionID.recurrency,
        multisig: parsedSessionID.multisig
      };
    },
    getFCTMessageHash: () => getFCTMessageHash(FCT.typedData),
    getSigners: () => {
      return FCT.mcall.reduce((acc, { from }) => {
        if (!acc.includes(from)) {
          acc.push(from);
        }
        return acc;
      }, []);
    }
  };
};
const getVariablesAsBytes32 = (variables) => {
  return variables.map((v) => {
    if (isNaN(Number(v)) || ethers.utils.isAddress(v)) {
      return `0x${String(v).replace("0x", "").padStart(64, "0")}`;
    }
    return `0x${Number(v).toString(16).padStart(64, "0")}`;
  });
};
const getAllFCTPaths = (fct) => {
  const g = new graphlib.Graph({ directed: true });
  fct.mcall.forEach((_, index) => {
    g.setNode(index.toString());
  });
  for (let i = 0; i < fct.mcall.length - 1; i++) {
    const callID = parseCallID(fct.mcall[i].callId, true);
    const jumpOnSuccess = callID.options.jumpOnSuccess;
    const jumpOnFail = callID.options.jumpOnFail;
    if (jumpOnSuccess === jumpOnFail) {
      g.setEdge(i.toString(), (i + 1 + Number(jumpOnSuccess)).toString());
    } else {
      g.setEdge(i.toString(), (i + 1 + Number(jumpOnSuccess)).toString());
      g.setEdge(i.toString(), (i + 1 + Number(jumpOnFail)).toString());
    }
  }
  const allPaths = [];
  const isVisited = {};
  const pathList = [];
  const start = "0";
  const end = (fct.mcall.length - 1).toString();
  pathList.push(start);
  const printAllPathsUtil = (g2, start2, end2, isVisited2, localPathList) => {
    if (start2 === end2) {
      const path = localPathList.slice();
      allPaths.push(path);
      return;
    }
    isVisited2[start2] = true;
    let successors = g2.successors(start2);
    if (successors === void 0) {
      successors = [];
    }
    for (const id of successors) {
      if (!isVisited2[id]) {
        localPathList.push(id);
        printAllPathsUtil(g2, id, end2, isVisited2, localPathList);
        localPathList.splice(localPathList.indexOf(id), 1);
      }
    }
    isVisited2[start2] = false;
  };
  printAllPathsUtil(g, start, end, isVisited, pathList);
  return allPaths;
};

const fetchCurrentApprovals = async ({
  rpcUrl,
  provider,
  data
}) => {
  if (!provider) {
    if (!rpcUrl) {
      throw new Error("No provider or rpcUrl provided");
    }
    provider = new ethers.ethers.providers.JsonRpcProvider(rpcUrl);
  }
  const chainId = (await provider.getNetwork()).chainId.toString();
  if (!multicallContracts[Number(chainId)]) {
    throw new Error("Multicall contract not found for this chain");
  }
  const multiCallContract = new ethers.ethers.Contract(
    multicallContracts[Number(chainId)],
    [
      "function aggregate((address target, bytes callData)[] calls) external view returns (uint256 blockNumber, bytes[] returnData)"
    ],
    provider
  );
  const calls = data.map((approval) => {
    return {
      target: approval.token,
      callData: new ethers.ethers.utils.Interface([
        "function allowance(address owner, address spender) view returns (uint256)"
      ]).encodeFunctionData("allowance", [approval.from, approval.spender])
    };
  });
  const [, returnData] = await multiCallContract.callStatic.aggregate(calls);
  const approvals = returnData.map((appr, index) => {
    const decoded = ethers.utils.defaultAbiCoder.decode(["uint256"], appr);
    return {
      ...data[index],
      value: decoded[0].toString()
    };
  });
  return approvals;
};

var FCTActuatorABI = [
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "by",
				type: "address"
			},
			{
				indexed: true,
				internalType: "address",
				name: "activator",
				type: "address"
			},
			{
				indexed: true,
				internalType: "bytes32",
				name: "id",
				type: "bytes32"
			},
			{
				indexed: false,
				internalType: "address",
				name: "builder",
				type: "address"
			},
			{
				components: [
					{
						internalType: "uint256",
						name: "kiroboPayment",
						type: "uint256"
					},
					{
						internalType: "uint256",
						name: "builderPayment",
						type: "uint256"
					},
					{
						internalType: "uint256",
						name: "activatorPayment",
						type: "uint256"
					},
					{
						internalType: "uint256",
						name: "base",
						type: "uint256"
					},
					{
						internalType: "uint256",
						name: "fees",
						type: "uint256"
					},
					{
						internalType: "uint256",
						name: "commonGas",
						type: "uint256"
					},
					{
						internalType: "uint256",
						name: "userGas",
						type: "uint256"
					},
					{
						internalType: "uint256",
						name: "missingKiro",
						type: "uint256"
					},
					{
						internalType: "uint256",
						name: "availableEth",
						type: "uint256"
					}
				],
				indexed: false,
				internalType: "struct Total",
				name: "total",
				type: "tuple"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "gasPrice",
				type: "uint256"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "timestamp",
				type: "uint256"
			}
		],
		name: "FCTE_Activated",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "activator",
				type: "address"
			},
			{
				indexed: true,
				internalType: "address",
				name: "operator",
				type: "address"
			},
			{
				components: [
					{
						internalType: "bool",
						name: "activate",
						type: "bool"
					},
					{
						internalType: "bool",
						name: "activateBatch",
						type: "bool"
					},
					{
						internalType: "bool",
						name: "activateForFree",
						type: "bool"
					},
					{
						internalType: "bool",
						name: "activateForFreeBatch",
						type: "bool"
					}
				],
				indexed: false,
				internalType: "struct IFCT_ActuatorStorage.Approvals",
				name: "approvals",
				type: "tuple"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "timestamp",
				type: "uint256"
			}
		],
		name: "FCTE_ActivationApproval",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "by",
				type: "address"
			},
			{
				indexed: true,
				internalType: "bytes32",
				name: "nameHash",
				type: "bytes32"
			},
			{
				indexed: true,
				internalType: "address",
				name: "builder",
				type: "address"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "timestamp",
				type: "uint256"
			}
		],
		name: "FCTE_BuilderUpdated",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "bytes32",
				name: "id",
				type: "bytes32"
			},
			{
				indexed: true,
				internalType: "address",
				name: "payer",
				type: "address"
			},
			{
				indexed: true,
				internalType: "address",
				name: "builder",
				type: "address"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "call",
				type: "uint256"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "totalKiroFees",
				type: "uint256"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "kiroPayed",
				type: "uint256"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "ethPayed",
				type: "uint256"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "builderPayment",
				type: "uint256"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "activatorPayment",
				type: "uint256"
			}
		],
		name: "FCTE_CallPayment",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				components: [
					{
						internalType: "uint32",
						name: "kiroPriceBPS",
						type: "uint32"
					},
					{
						internalType: "bool",
						name: "paused",
						type: "bool"
					},
					{
						internalType: "bool",
						name: "freezed",
						type: "bool"
					}
				],
				indexed: false,
				internalType: "struct IFCT_ActuatorStorage.EthPenalty",
				name: "ethPenalty",
				type: "tuple"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "timestamp",
				type: "uint256"
			}
		],
		name: "FCTE_EthStatusChanged",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "by",
				type: "address"
			},
			{
				indexed: true,
				internalType: "address",
				name: "activator",
				type: "address"
			},
			{
				indexed: true,
				internalType: "bytes32",
				name: "id",
				type: "bytes32"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "activatorFees",
				type: "uint256"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "calcGas",
				type: "uint256"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "gasPrice",
				type: "uint256"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "timestamp",
				type: "uint256"
			}
		],
		name: "FCTE_ForFreeActivated",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "by",
				type: "address"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "feesLimitBPS",
				type: "uint256"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "timestamp",
				type: "uint256"
			}
		],
		name: "FCTE_ForFreeFeesLimitUpdated",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "from",
				type: "address"
			},
			{
				indexed: true,
				internalType: "address",
				name: "to",
				type: "address"
			},
			{
				components: [
					{
						internalType: "uint96",
						name: "kiro",
						type: "uint96"
					},
					{
						internalType: "uint96",
						name: "eth",
						type: "uint96"
					}
				],
				indexed: false,
				internalType: "struct IFCT_ActuatorStorage.Balance",
				name: "balance",
				type: "tuple"
			},
			{
				components: [
					{
						internalType: "uint96",
						name: "kiro",
						type: "uint96"
					},
					{
						internalType: "uint96",
						name: "eth",
						type: "uint96"
					}
				],
				indexed: false,
				internalType: "struct IFCT_ActuatorStorage.Balance",
				name: "amounts",
				type: "tuple"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "timestamp",
				type: "uint256"
			}
		],
		name: "FCTE_FundsAdded",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "account",
				type: "address"
			},
			{
				components: [
					{
						internalType: "uint96",
						name: "kiro",
						type: "uint96"
					},
					{
						internalType: "uint96",
						name: "eth",
						type: "uint96"
					}
				],
				indexed: false,
				internalType: "struct IFCT_ActuatorStorage.Balance",
				name: "staking",
				type: "tuple"
			},
			{
				components: [
					{
						internalType: "uint96",
						name: "kiro",
						type: "uint96"
					},
					{
						internalType: "uint96",
						name: "eth",
						type: "uint96"
					}
				],
				indexed: false,
				internalType: "struct IFCT_ActuatorStorage.Balance",
				name: "balance",
				type: "tuple"
			},
			{
				components: [
					{
						internalType: "uint96",
						name: "kiro",
						type: "uint96"
					},
					{
						internalType: "uint96",
						name: "eth",
						type: "uint96"
					}
				],
				indexed: false,
				internalType: "struct IFCT_ActuatorStorage.Balance",
				name: "amounts",
				type: "tuple"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "timestamp",
				type: "uint256"
			}
		],
		name: "FCTE_FundsMovedFromDeposit",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "account",
				type: "address"
			},
			{
				components: [
					{
						internalType: "uint96",
						name: "kiro",
						type: "uint96"
					},
					{
						internalType: "uint96",
						name: "eth",
						type: "uint96"
					}
				],
				indexed: false,
				internalType: "struct IFCT_ActuatorStorage.Balance",
				name: "balance",
				type: "tuple"
			},
			{
				components: [
					{
						internalType: "uint96",
						name: "kiro",
						type: "uint96"
					},
					{
						internalType: "uint96",
						name: "eth",
						type: "uint96"
					}
				],
				indexed: false,
				internalType: "struct IFCT_ActuatorStorage.Balance",
				name: "staking",
				type: "tuple"
			},
			{
				components: [
					{
						internalType: "uint96",
						name: "kiro",
						type: "uint96"
					},
					{
						internalType: "uint96",
						name: "eth",
						type: "uint96"
					}
				],
				indexed: false,
				internalType: "struct IFCT_ActuatorStorage.Balance",
				name: "amounts",
				type: "tuple"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "timestamp",
				type: "uint256"
			}
		],
		name: "FCTE_FundsMovedToDeposit",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "account",
				type: "address"
			},
			{
				components: [
					{
						internalType: "uint96",
						name: "kiro",
						type: "uint96"
					},
					{
						internalType: "uint96",
						name: "eth",
						type: "uint96"
					}
				],
				indexed: false,
				internalType: "struct IFCT_ActuatorStorage.Balance",
				name: "balance",
				type: "tuple"
			},
			{
				components: [
					{
						internalType: "uint96",
						name: "kiro",
						type: "uint96"
					},
					{
						internalType: "uint96",
						name: "eth",
						type: "uint96"
					}
				],
				indexed: false,
				internalType: "struct IFCT_ActuatorStorage.Balance",
				name: "amounts",
				type: "tuple"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "timestamp",
				type: "uint256"
			}
		],
		name: "FCTE_FundsRemoved",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "oldAddress",
				type: "address"
			},
			{
				indexed: true,
				internalType: "address",
				name: "newAddress",
				type: "address"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "timestamp",
				type: "uint256"
			}
		],
		name: "FCTE_KiroFundingUpdated",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "by",
				type: "address"
			},
			{
				indexed: true,
				internalType: "address",
				name: "activator",
				type: "address"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "price",
				type: "uint256"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "timestamp",
				type: "uint256"
			}
		],
		name: "FCTE_KiroPriceUpdated",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "by",
				type: "address"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "timeLength",
				type: "uint256"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "timestamp",
				type: "uint256"
			}
		],
		name: "FCTE_KiroPriceWindowUpdated",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "by",
				type: "address"
			},
			{
				indexed: true,
				internalType: "address",
				name: "wallet",
				type: "address"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "timestamp",
				type: "uint256"
			}
		],
		name: "FCTE_KiroboWalletUpdated",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "by",
				type: "address"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "maxBatchedForFree",
				type: "uint256"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "timestamp",
				type: "uint256"
			}
		],
		name: "FCTE_MaxBatchedForFreeUpdated",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "by",
				type: "address"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "maxBatche",
				type: "uint256"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "timestamp",
				type: "uint256"
			}
		],
		name: "FCTE_MaxBatchedUpdated",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "by",
				type: "address"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "minStaking",
				type: "uint256"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "timestamp",
				type: "uint256"
			}
		],
		name: "FCTE_MinStakingUpdated",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "by",
				type: "address"
			},
			{
				indexed: true,
				internalType: "address",
				name: "activator",
				type: "address"
			},
			{
				indexed: true,
				internalType: "bytes32",
				name: "id",
				type: "bytes32"
			},
			{
				indexed: false,
				internalType: "address",
				name: "builder",
				type: "address"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "activatorFees",
				type: "uint256"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "builderPayement",
				type: "uint256"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "calcGas",
				type: "uint256"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "gasPrice",
				type: "uint256"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "timestamp",
				type: "uint256"
			}
		],
		name: "FCTE_NoPayerActivated",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "account",
				type: "address"
			},
			{
				components: [
					{
						internalType: "uint96",
						name: "kiro",
						type: "uint96"
					},
					{
						internalType: "uint96",
						name: "eth",
						type: "uint96"
					}
				],
				indexed: false,
				internalType: "struct IFCT_ActuatorStorage.Balance",
				name: "staking",
				type: "tuple"
			},
			{
				components: [
					{
						internalType: "uint96",
						name: "kiro",
						type: "uint96"
					},
					{
						internalType: "uint96",
						name: "eth",
						type: "uint96"
					}
				],
				indexed: false,
				internalType: "struct IFCT_ActuatorStorage.Balance",
				name: "amount",
				type: "tuple"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "timestamp",
				type: "uint256"
			}
		],
		name: "FCTE_StakingAdded",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "account",
				type: "address"
			},
			{
				components: [
					{
						internalType: "uint96",
						name: "kiro",
						type: "uint96"
					},
					{
						internalType: "uint96",
						name: "eth",
						type: "uint96"
					}
				],
				indexed: false,
				internalType: "struct IFCT_ActuatorStorage.Balance",
				name: "staking",
				type: "tuple"
			},
			{
				components: [
					{
						internalType: "uint96",
						name: "kiro",
						type: "uint96"
					},
					{
						internalType: "uint96",
						name: "eth",
						type: "uint96"
					}
				],
				indexed: false,
				internalType: "struct IFCT_ActuatorStorage.Balance",
				name: "amount",
				type: "tuple"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "timestamp",
				type: "uint256"
			}
		],
		name: "FCTE_StakingRemoved",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "by",
				type: "address"
			},
			{
				indexed: true,
				internalType: "bytes6",
				name: "id",
				type: "bytes6"
			},
			{
				indexed: true,
				internalType: "address",
				name: "tokenomics",
				type: "address"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "timestamp",
				type: "uint256"
			}
		],
		name: "FCTE_TokenomicsUpdated",
		type: "event"
	},
	{
		inputs: [
			{
				internalType: "bytes",
				name: "data",
				type: "bytes"
			},
			{
				internalType: "address",
				name: "activator",
				type: "address"
			}
		],
		name: "activate",
		outputs: [
			{
				internalType: "uint256",
				name: "activatorPaymentOrFees",
				type: "uint256"
			}
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "bytes[]",
				name: "data",
				type: "bytes[]"
			},
			{
				internalType: "address",
				name: "activator",
				type: "address"
			}
		],
		name: "activateBatch",
		outputs: [
			{
				internalType: "uint256[]",
				name: "ret",
				type: "uint256[]"
			}
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "bytes",
				name: "data",
				type: "bytes"
			},
			{
				internalType: "address",
				name: "activator",
				type: "address"
			}
		],
		name: "activateForFree",
		outputs: [
			{
				internalType: "uint256",
				name: "activatorPaymentOrFees",
				type: "uint256"
			}
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "bytes[]",
				name: "data",
				type: "bytes[]"
			},
			{
				internalType: "address",
				name: "activator",
				type: "address"
			}
		],
		name: "activateForFreeBatch",
		outputs: [
			{
				internalType: "uint256[]",
				name: "ret",
				type: "uint256[]"
			}
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "uint96",
				name: "kiro",
				type: "uint96"
			}
		],
		name: "addFunds",
		outputs: [
		],
		stateMutability: "payable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "to",
				type: "address"
			},
			{
				internalType: "uint96",
				name: "amount",
				type: "uint96"
			}
		],
		name: "addFundsTo",
		outputs: [
		],
		stateMutability: "payable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "uint96",
				name: "kiro",
				type: "uint96"
			}
		],
		name: "deposit",
		outputs: [
		],
		stateMutability: "payable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "amountIn",
				type: "uint256"
			}
		],
		name: "getAmountOfEthForGivenKiro",
		outputs: [
			{
				internalType: "uint256",
				name: "amountOut",
				type: "uint256"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "amountIn",
				type: "uint256"
			}
		],
		name: "getAmountOfKiroForGivenEth",
		outputs: [
			{
				internalType: "uint256",
				name: "amountOut",
				type: "uint256"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "activator",
				type: "address"
			},
			{
				internalType: "address",
				name: "operator",
				type: "address"
			}
		],
		name: "isActivationApproved",
		outputs: [
			{
				components: [
					{
						internalType: "bool",
						name: "activate",
						type: "bool"
					},
					{
						internalType: "bool",
						name: "activateBatch",
						type: "bool"
					},
					{
						internalType: "bool",
						name: "activateForFree",
						type: "bool"
					},
					{
						internalType: "bool",
						name: "activateForFreeBatch",
						type: "bool"
					}
				],
				internalType: "struct IFCT_ActuatorStorage.Approvals",
				name: "",
				type: "tuple"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "uint96",
				name: "kiro",
				type: "uint96"
			},
			{
				internalType: "uint96",
				name: "eth",
				type: "uint96"
			}
		],
		name: "moveFundsFromDeposit",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "uint96",
				name: "kiro",
				type: "uint96"
			},
			{
				internalType: "uint96",
				name: "eth",
				type: "uint96"
			}
		],
		name: "moveFundsToDeposit",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "uint96",
				name: "kiro",
				type: "uint96"
			},
			{
				internalType: "uint96",
				name: "eth",
				type: "uint96"
			}
		],
		name: "removeFunds",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "",
				type: "address"
			}
		],
		name: "s_balances",
		outputs: [
			{
				internalType: "uint96",
				name: "kiro",
				type: "uint96"
			},
			{
				internalType: "uint96",
				name: "eth",
				type: "uint96"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "bytes32",
				name: "nameHash",
				type: "bytes32"
			}
		],
		name: "s_builders",
		outputs: [
			{
				internalType: "address",
				name: "",
				type: "address"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "s_ethPenalty",
		outputs: [
			{
				internalType: "uint32",
				name: "",
				type: "uint32"
			},
			{
				internalType: "bool",
				name: "",
				type: "bool"
			},
			{
				internalType: "bool",
				name: "",
				type: "bool"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "s_forFreeFeesLimitBPS",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "s_kiroFunding",
		outputs: [
			{
				internalType: "address",
				name: "",
				type: "address"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "s_kirobo",
		outputs: [
			{
				internalType: "address",
				name: "",
				type: "address"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "s_maxBatched",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "s_maxBatchedForFree",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "s_minStaking",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "",
				type: "address"
			}
		],
		name: "s_staked",
		outputs: [
			{
				internalType: "uint96",
				name: "kiro",
				type: "uint96"
			},
			{
				internalType: "uint96",
				name: "eth",
				type: "uint96"
			},
			{
				internalType: "uint64",
				name: "blockNumber",
				type: "uint64"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "bytes6",
				name: "",
				type: "bytes6"
			}
		],
		name: "s_tokenomics",
		outputs: [
			{
				internalType: "address",
				name: "",
				type: "address"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "s_totalStaked",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "operator",
				type: "address"
			},
			{
				components: [
					{
						internalType: "bool",
						name: "activate",
						type: "bool"
					},
					{
						internalType: "bool",
						name: "activateBatch",
						type: "bool"
					},
					{
						internalType: "bool",
						name: "activateForFree",
						type: "bool"
					},
					{
						internalType: "bool",
						name: "activateForFreeBatch",
						type: "bool"
					}
				],
				internalType: "struct IFCT_ActuatorStorage.Approvals",
				name: "approvals",
				type: "tuple"
			}
		],
		name: "setActivationApproval",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "bytes32",
				name: "nameHash",
				type: "bytes32"
			},
			{
				internalType: "address",
				name: "builder",
				type: "address"
			}
		],
		name: "setBuilder",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "uint32",
				name: "kiroPriceBPS",
				type: "uint32"
			}
		],
		name: "setEthMatchup",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "bool",
				name: "pause",
				type: "bool"
			},
			{
				internalType: "bool",
				name: "freeze",
				type: "bool"
			}
		],
		name: "setEthState",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "feesLimitBPS",
				type: "uint256"
			}
		],
		name: "setForFreeFeesLimitBPS",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "kiroFunding",
				type: "address"
			}
		],
		name: "setKiroFunding",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "kirobo",
				type: "address"
			}
		],
		name: "setKiroboWallet",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "maxBatched",
				type: "uint256"
			}
		],
		name: "setMaxBatched",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "maxBatchedForFree",
				type: "uint256"
			}
		],
		name: "setMaxBatchedForFree",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "minStaking",
				type: "uint256"
			}
		],
		name: "setMinStaking",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "bytes6",
				name: "id",
				type: "bytes6"
			},
			{
				internalType: "address",
				name: "tokenomics",
				type: "address"
			}
		],
		name: "setTokenomics",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "time",
				type: "uint256"
			}
		],
		name: "updateTimeBetweenKiroPriceUpdate",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "uint96",
				name: "kiro",
				type: "uint96"
			},
			{
				internalType: "uint96",
				name: "eth",
				type: "uint96"
			}
		],
		name: "withdraw",
		outputs: [
		],
		stateMutability: "payable",
		type: "function"
	}
];

var BatchMultiSigCallABI = [
	{
		inputs: [
		],
		stateMutability: "nonpayable",
		type: "constructor"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "bytes32",
				name: "id",
				type: "bytes32"
			},
			{
				indexed: true,
				internalType: "address",
				name: "caller",
				type: "address"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "callIndex",
				type: "uint256"
			}
		],
		name: "FCTE_CallFailed",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "bytes32",
				name: "id",
				type: "bytes32"
			},
			{
				indexed: true,
				internalType: "address",
				name: "caller",
				type: "address"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "callIndex",
				type: "uint256"
			}
		],
		name: "FCTE_CallSucceed",
		type: "event"
	},
	{
		inputs: [
		],
		name: "BATCH_MULTI_SIG_CALL_ID",
		outputs: [
			{
				internalType: "bytes32",
				name: "",
				type: "bytes32"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "VERSION",
		outputs: [
			{
				internalType: "bytes3",
				name: "",
				type: "bytes3"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "bytes",
				name: "data",
				type: "bytes"
			},
			{
				internalType: "uint256[]",
				name: "types",
				type: "uint256[]"
			},
			{
				internalType: "bytes32[]",
				name: "typedHashes",
				type: "bytes32[]"
			},
			{
				components: [
					{
						internalType: "uint256",
						name: "data",
						type: "uint256"
					},
					{
						internalType: "uint256",
						name: "types",
						type: "uint256"
					}
				],
				internalType: "struct FCT_BatchMultiSig.Offset",
				name: "offset",
				type: "tuple"
			}
		],
		name: "abiToEIP712",
		outputs: [
			{
				internalType: "bytes",
				name: "res",
				type: "bytes"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "bytes32",
				name: "version",
				type: "bytes32"
			},
			{
				components: [
					{
						internalType: "bytes32",
						name: "typeHash",
						type: "bytes32"
					},
					{
						internalType: "uint256",
						name: "sessionId",
						type: "uint256"
					},
					{
						internalType: "bytes32",
						name: "nameHash",
						type: "bytes32"
					},
					{
						internalType: "address",
						name: "builder",
						type: "address"
					},
					{
						components: [
							{
								internalType: "bytes32",
								name: "typeHash",
								type: "bytes32"
							},
							{
								internalType: "bytes32",
								name: "ensHash",
								type: "bytes32"
							},
							{
								internalType: "bytes32",
								name: "functionSignature",
								type: "bytes32"
							},
							{
								internalType: "uint256",
								name: "value",
								type: "uint256"
							},
							{
								internalType: "uint256",
								name: "callId",
								type: "uint256"
							},
							{
								internalType: "address",
								name: "from",
								type: "address"
							},
							{
								internalType: "address",
								name: "to",
								type: "address"
							},
							{
								internalType: "bytes",
								name: "data",
								type: "bytes"
							},
							{
								internalType: "uint256[]",
								name: "types",
								type: "uint256[]"
							},
							{
								internalType: "bytes32[]",
								name: "typedHashes",
								type: "bytes32[]"
							}
						],
						internalType: "struct FCT_BatchMultiSig.MSCall[]",
						name: "mcall",
						type: "tuple[]"
					},
					{
						components: [
							{
								internalType: "bytes32",
								name: "r",
								type: "bytes32"
							},
							{
								internalType: "bytes32",
								name: "s",
								type: "bytes32"
							},
							{
								internalType: "uint8",
								name: "v",
								type: "uint8"
							}
						],
						internalType: "struct FCT_BatchMultiSig.Signature[]",
						name: "signatures",
						type: "tuple[]"
					},
					{
						internalType: "bytes32[]",
						name: "variables",
						type: "bytes32[]"
					},
					{
						internalType: "address[]",
						name: "externalSigners",
						type: "address[]"
					},
					{
						components: [
							{
								internalType: "uint256",
								name: "variable",
								type: "uint256"
							},
							{
								internalType: "uint256",
								name: "add",
								type: "uint256"
							},
							{
								internalType: "uint256",
								name: "sub",
								type: "uint256"
							},
							{
								internalType: "uint256",
								name: "mul",
								type: "uint256"
							},
							{
								internalType: "uint256",
								name: "div",
								type: "uint256"
							}
						],
						internalType: "struct FCT_BatchMultiSig.Computed[]",
						name: "computed",
						type: "tuple[]"
					}
				],
				internalType: "struct FCT_BatchMultiSig.MSCalls",
				name: "tr",
				type: "tuple"
			},
			{
				internalType: "bytes32",
				name: "purgeFCT",
				type: "bytes32"
			},
			{
				internalType: "address",
				name: "investor",
				type: "address"
			},
			{
				internalType: "address",
				name: "activator",
				type: "address"
			}
		],
		name: "batchMultiSigCall",
		outputs: [
			{
				internalType: "bytes32",
				name: "name",
				type: "bytes32"
			},
			{
				internalType: "address",
				name: "builder",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "maxGasPrice",
				type: "uint256"
			},
			{
				components: [
					{
						internalType: "address",
						name: "payer",
						type: "address"
					},
					{
						internalType: "uint88",
						name: "gas",
						type: "uint88"
					}
				],
				internalType: "struct MReturn[]",
				name: "rt",
				type: "tuple[]"
			}
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
		],
		name: "getIDs",
		outputs: [
			{
				internalType: "bytes32[]",
				name: "res",
				type: "bytes32[]"
			}
		],
		stateMutability: "pure",
		type: "function"
	}
];

var FCTControllerABI = [
	{
		inputs: [
		],
		stateMutability: "nonpayable",
		type: "constructor"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "ens",
				type: "address"
			},
			{
				indexed: true,
				internalType: "address",
				name: "prevEns",
				type: "address"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "timestamp",
				type: "uint256"
			}
		],
		name: "FCTE_ENSChanged",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "bytes32",
				name: "ensHash",
				type: "bytes32"
			},
			{
				indexed: true,
				internalType: "address",
				name: "dest",
				type: "address"
			},
			{
				indexed: true,
				internalType: "address",
				name: "prevDest",
				type: "address"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "timestamp",
				type: "uint256"
			},
			{
				indexed: false,
				internalType: "string",
				name: "ens",
				type: "string"
			}
		],
		name: "FCTE_LocalENSChanged",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "bytes32",
				name: "id",
				type: "bytes32"
			},
			{
				indexed: true,
				internalType: "bytes32",
				name: "messageHash",
				type: "bytes32"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "meta",
				type: "uint256"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "timestamp",
				type: "uint256"
			}
		],
		name: "FCTE_Purged",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "bytes32",
				name: "id",
				type: "bytes32"
			},
			{
				indexed: true,
				internalType: "bytes32",
				name: "messageHash",
				type: "bytes32"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "meta",
				type: "uint256"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "timestamp",
				type: "uint256"
			}
		],
		name: "FCTE_Registered",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "bytes32",
				name: "id",
				type: "bytes32"
			},
			{
				indexed: true,
				internalType: "address",
				name: "impl",
				type: "address"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "timestamp",
				type: "uint256"
			}
		],
		name: "FCTE_TargetAdded",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "bytes32",
				name: "role",
				type: "bytes32"
			},
			{
				indexed: true,
				internalType: "bytes32",
				name: "previousAdminRole",
				type: "bytes32"
			},
			{
				indexed: true,
				internalType: "bytes32",
				name: "newAdminRole",
				type: "bytes32"
			}
		],
		name: "RoleAdminChanged",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "bytes32",
				name: "role",
				type: "bytes32"
			},
			{
				indexed: true,
				internalType: "address",
				name: "account",
				type: "address"
			},
			{
				indexed: true,
				internalType: "address",
				name: "sender",
				type: "address"
			}
		],
		name: "RoleGranted",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "bytes32",
				name: "role",
				type: "bytes32"
			},
			{
				indexed: true,
				internalType: "address",
				name: "account",
				type: "address"
			},
			{
				indexed: true,
				internalType: "address",
				name: "sender",
				type: "address"
			}
		],
		name: "RoleRevoked",
		type: "event"
	},
	{
		stateMutability: "nonpayable",
		type: "fallback"
	},
	{
		inputs: [
		],
		name: "ACTIVATION_ID_MASK",
		outputs: [
			{
				internalType: "bytes32",
				name: "",
				type: "bytes32"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "ACTUATOR_ADMIN_ROLE",
		outputs: [
			{
				internalType: "bytes32",
				name: "",
				type: "bytes32"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "ACTUATOR_ROLE",
		outputs: [
			{
				internalType: "bytes32",
				name: "",
				type: "bytes32"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "CHAIN_ID",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "DEFAULT_ADMIN_ROLE",
		outputs: [
			{
				internalType: "bytes32",
				name: "",
				type: "bytes32"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "DOMAIN_SEPARATOR",
		outputs: [
			{
				internalType: "bytes32",
				name: "",
				type: "bytes32"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "ENS_ADMIN_ROLE",
		outputs: [
			{
				internalType: "bytes32",
				name: "",
				type: "bytes32"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "ENS_ROLE",
		outputs: [
			{
				internalType: "bytes32",
				name: "",
				type: "bytes32"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "ID_VERSION_MASK",
		outputs: [
			{
				internalType: "bytes32",
				name: "",
				type: "bytes32"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "LOCAL_ENS_ADMIN_ROLE",
		outputs: [
			{
				internalType: "bytes32",
				name: "",
				type: "bytes32"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "LOCAL_ENS_ROLE",
		outputs: [
			{
				internalType: "bytes32",
				name: "",
				type: "bytes32"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "META_ACCUMATABLE_FLAG",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "META_BLOCKABLE_FLAG",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "META_EIP712_FLAG",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "META_PURGABLE_FLAG",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "NAME",
		outputs: [
			{
				internalType: "string",
				name: "",
				type: "string"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "TARGET_ADMIN_ROLE",
		outputs: [
			{
				internalType: "bytes32",
				name: "",
				type: "bytes32"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "TARGET_ROLE",
		outputs: [
			{
				internalType: "bytes32",
				name: "",
				type: "bytes32"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "UID",
		outputs: [
			{
				internalType: "bytes32",
				name: "",
				type: "bytes32"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "VERSION",
		outputs: [
			{
				internalType: "string",
				name: "",
				type: "string"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "VERSION_NUMBER",
		outputs: [
			{
				internalType: "uint8",
				name: "",
				type: "uint8"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "bytes32",
				name: "id",
				type: "bytes32"
			}
		],
		name: "activationId",
		outputs: [
			{
				internalType: "bytes32",
				name: "",
				type: "bytes32"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "_target",
				type: "address"
			}
		],
		name: "addTarget",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "bytes32",
				name: "ensHash",
				type: "bytes32"
			},
			{
				internalType: "address",
				name: "expectedAddress",
				type: "address"
			}
		],
		name: "ensToAddress",
		outputs: [
			{
				internalType: "address",
				name: "result",
				type: "address"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "bytes32",
				name: "messageHash",
				type: "bytes32"
			}
		],
		name: "fctMetaPacked",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "bytes32",
				name: "role",
				type: "bytes32"
			}
		],
		name: "getRoleAdmin",
		outputs: [
			{
				internalType: "bytes32",
				name: "",
				type: "bytes32"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "bytes32",
				name: "role",
				type: "bytes32"
			},
			{
				internalType: "address",
				name: "account",
				type: "address"
			}
		],
		name: "grantRole",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "bytes32",
				name: "role",
				type: "bytes32"
			},
			{
				internalType: "address",
				name: "account",
				type: "address"
			}
		],
		name: "hasRole",
		outputs: [
			{
				internalType: "bool",
				name: "",
				type: "bool"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "bytes32",
				name: "id",
				type: "bytes32"
			},
			{
				internalType: "bytes32[]",
				name: "messageHashes",
				type: "bytes32[]"
			}
		],
		name: "purge",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "bytes32",
				name: "id",
				type: "bytes32"
			},
			{
				internalType: "bytes32",
				name: "dataHash",
				type: "bytes32"
			},
			{
				components: [
					{
						internalType: "uint40",
						name: "expiresAt",
						type: "uint40"
					},
					{
						internalType: "uint32",
						name: "chilltime",
						type: "uint32"
					},
					{
						internalType: "uint16",
						name: "maxRepeats",
						type: "uint16"
					},
					{
						internalType: "bool",
						name: "accumatable",
						type: "bool"
					},
					{
						internalType: "bool",
						name: "eip712",
						type: "bool"
					},
					{
						internalType: "bool",
						name: "purgeable",
						type: "bool"
					},
					{
						internalType: "bool",
						name: "blockable",
						type: "bool"
					},
					{
						internalType: "uint24",
						name: "reserved",
						type: "uint24"
					}
				],
				internalType: "struct MetaInput",
				name: "meta",
				type: "tuple"
			}
		],
		name: "register",
		outputs: [
			{
				internalType: "bytes32",
				name: "messageHash",
				type: "bytes32"
			},
			{
				internalType: "uint256",
				name: "newMeta",
				type: "uint256"
			},
			{
				internalType: "bytes32",
				name: "newActivationId",
				type: "bytes32"
			}
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "bytes32",
				name: "role",
				type: "bytes32"
			},
			{
				internalType: "address",
				name: "account",
				type: "address"
			}
		],
		name: "renounceRole",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "bytes32",
				name: "role",
				type: "bytes32"
			},
			{
				internalType: "address",
				name: "account",
				type: "address"
			}
		],
		name: "revokeRole",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "bytes32",
				name: "",
				type: "bytes32"
			}
		],
		name: "s_activations",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "s_ens",
		outputs: [
			{
				internalType: "address",
				name: "",
				type: "address"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "bytes32",
				name: "",
				type: "bytes32"
			}
		],
		name: "s_fcts",
		outputs: [
			{
				internalType: "uint8",
				name: "flags",
				type: "uint8"
			},
			{
				internalType: "uint40",
				name: "expiresAt",
				type: "uint40"
			},
			{
				internalType: "uint40",
				name: "starttime",
				type: "uint40"
			},
			{
				internalType: "uint40",
				name: "lasttime",
				type: "uint40"
			},
			{
				internalType: "uint40",
				name: "timestamp",
				type: "uint40"
			},
			{
				internalType: "uint32",
				name: "chilltime",
				type: "uint32"
			},
			{
				internalType: "uint16",
				name: "repeatsLeft",
				type: "uint16"
			},
			{
				internalType: "uint16",
				name: "maxRepeats",
				type: "uint16"
			},
			{
				internalType: "uint24",
				name: "reserved",
				type: "uint24"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "bytes32",
				name: "",
				type: "bytes32"
			}
		],
		name: "s_local_ens",
		outputs: [
			{
				internalType: "address",
				name: "",
				type: "address"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "bytes32",
				name: "",
				type: "bytes32"
			}
		],
		name: "s_targets",
		outputs: [
			{
				internalType: "address",
				name: "",
				type: "address"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "ens",
				type: "address"
			}
		],
		name: "setEns",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "string",
				name: "ens",
				type: "string"
			},
			{
				internalType: "address",
				name: "dest",
				type: "address"
			}
		],
		name: "setLocalEns",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "bytes4",
				name: "interfaceId",
				type: "bytes4"
			}
		],
		name: "supportsInterface",
		outputs: [
			{
				internalType: "bool",
				name: "",
				type: "bool"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "bytes32",
				name: "id",
				type: "bytes32"
			}
		],
		name: "target",
		outputs: [
			{
				internalType: "address",
				name: "",
				type: "address"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "bytes32",
				name: "id",
				type: "bytes32"
			}
		],
		name: "version",
		outputs: [
			{
				internalType: "bytes3",
				name: "",
				type: "bytes3"
			}
		],
		stateMutability: "view",
		type: "function"
	}
];

const isInteger = (value, key) => {
  if (value.length === 0) {
    throw new Error(`${key} cannot be empty string`);
  }
  if (value.startsWith("-")) {
    throw new Error(`${key} cannot be negative`);
  }
  if (value.includes(".")) {
    throw new Error(`${key} cannot be a decimal`);
  }
};
const isAddress = (value, key) => {
  if (value.length === 0) {
    throw new Error(`${key} address cannot be empty string`);
  }
  if (!ethers.utils.isAddress(value)) {
    throw new Error(`${key} address is not a valid address`);
  }
};
function verifyCall(call) {
  if (!call.to) {
    throw new Error("To address is required");
  } else if (typeof call.to === "string") {
    isAddress(call.to, "To");
  }
  if (call.value && typeof call.value === "string") {
    isInteger(call.value, "Value");
  }
  if (call.method && call.method.length === 0) {
    throw new Error("Method cannot be empty string");
  }
  if (call.nodeId) {
    const index = this.calls.findIndex((item) => item.nodeId === call.nodeId);
    if (index > 0) {
      throw new Error(`Node ID ${call.nodeId} already exists, please use a different one`);
    }
  }
  if (call.options) {
    const { gasLimit, callType } = call.options;
    if (gasLimit && typeof gasLimit === "string") {
      isInteger(gasLimit, "Gas limit");
    }
    if (callType) {
      const keysOfCALLTYPE = Object.keys(CALL_TYPE);
      if (!keysOfCALLTYPE.includes(callType)) {
        throw new Error(`Call type ${callType} is not valid`);
      }
    }
  }
  if (call.params && call.params.length) {
    if (!call.method) {
      throw new Error("Method is required when params are present");
    }
    call.params.map(verifyParam);
  }
}

const TYPED_DATA_DOMAIN = {
  "1": {
    name: "FCT Controller",
    version: "1",
    chainId: 1,
    verifyingContract: "0x087550a787B2720AAC06351065afC1F413D82572",
    // salt: getSaltBuffer("0x01005fc59cf4781ce0b30000087550a787b2720aac06351065afc1f413d82572"),
    salt: "0x01005fc59cf4781ce0b30000087550a787b2720aac06351065afc1f413d82572"
  },
  "5": {
    name: "FCT Controller",
    version: "1",
    chainId: 5,
    verifyingContract: "0x087550a787B2720AAC06351065afC1F413D82572",
    // salt: getSaltBuffer("0x01005fc59cf4781ce0b30000087550a787b2720aac06351065afc1f413d82572"),
    salt: "0x01005fc59cf4781ce0b30000087550a787b2720aac06351065afc1f413d82572"
  }
};
const getTypedDataDomain = (chainId) => {
  return TYPED_DATA_DOMAIN[chainId];
};
const getParamsFromInputs = (inputs, values) => {
  return inputs.map((input) => {
    if (input.type === "tuple") {
      return {
        name: input.name,
        type: input.type,
        customType: true,
        value: getParamsFromInputs(input.components, values[input.name])
      };
    }
    if (input.type === "tuple[]") {
      return {
        name: input.name,
        type: input.type,
        customType: true,
        value: values[input.name].map((tuple) => getParamsFromInputs(input.components, tuple))
      };
    }
    return {
      name: input.name,
      type: input.type,
      value: values[input.name]
    };
  });
};

function generateNodeId() {
  return [...Array(6)].map(() => Math.floor(Math.random() * 16).toString(16)).join("");
}
async function create(callInput) {
  if ("plugin" in callInput) {
    return await this.createWithPlugin(callInput);
  } else if ("abi" in callInput) {
    return await this.createWithEncodedData(callInput);
  } else {
    const data = { ...callInput, nodeId: callInput.nodeId || generateNodeId() };
    this.verifyCall(data);
    this.calls.push(data);
    return data;
  }
}
async function createMultiple(calls) {
  const callsCreated = [];
  for (const [index, call] of calls.entries()) {
    try {
      const createdCall = await this.create(call);
      callsCreated.push(createdCall);
    } catch (err) {
      if (err instanceof Error) {
        throw new Error(`Error creating call ${index + 1}: ${err.message}`);
      }
    }
  }
  return this.calls;
}
async function createWithPlugin(callWithPlugin) {
  const pluginCall = await callWithPlugin.plugin.create();
  if (pluginCall === void 0) {
    throw new Error("Error creating call with plugin. Make sure input values are valid");
  }
  const data = {
    ...pluginCall,
    from: callWithPlugin.from,
    options: { ...pluginCall.options, ...callWithPlugin.options },
    nodeId: callWithPlugin.nodeId || generateNodeId()
  };
  this.verifyCall(data);
  this.calls.push(data);
  return data;
}
async function createWithEncodedData(callWithEncodedData) {
  const { value, encodedData, abi, options, nodeId } = callWithEncodedData;
  const iface = new ethers.ethers.utils.Interface(abi);
  const {
    name,
    args,
    value: txValue,
    functionFragment: { inputs }
  } = iface.parseTransaction({
    data: encodedData,
    value: typeof value === "string" ? value : "0"
  });
  const data = {
    from: callWithEncodedData.from,
    to: callWithEncodedData.to,
    method: name,
    params: getParamsFromInputs(inputs, args),
    options,
    value: txValue?.toString(),
    nodeId: nodeId || generateNodeId()
  };
  this.verifyCall(data);
  this.calls.push(data);
  return data;
}
function createPlugin(Plugin) {
  return new Plugin({
    chainId: this.chainId
  });
}
function getCall(index) {
  if (index < 0 || index >= this.calls.length) {
    throw new Error("Index out of range");
  }
  return this.calls[index];
}
function exportFCT() {
  this.computedVariables = [];
  const calls = this.strictCalls;
  if (this.calls.length === 0) {
    throw new Error("No calls added");
  }
  verifyOptions(this._options);
  const salt = [...Array(6)].map(() => Math.floor(Math.random() * 16).toString(16)).join("");
  const typedData = this.createTypedData(salt, this.version);
  const sessionId = getSessionId(salt, this.version, this.options);
  const mcall = calls.map((call, index) => {
    const usedTypeStructs = getUsedStructTypes(typedData, `transaction${index + 1}`);
    return {
      typeHash: ethers.utils.hexlify(ethSigUtil.TypedDataUtils.hashType(`transaction${index + 1}`, typedData.types)),
      ensHash: handleEnsHash(call),
      functionSignature: handleFunctionSignature(call),
      value: this.handleValue(call),
      callId: manageCallId(this.calls, call, index),
      from: typeof call.from === "string" ? call.from : this.getVariable(call.from, "address"),
      to: this.handleTo(call),
      data: handleData(call),
      types: handleTypes(call),
      typedHashes: usedTypeStructs.length > 0 ? usedTypeStructs.map((hash) => ethers.utils.hexlify(ethSigUtil.TypedDataUtils.hashType(hash, typedData.types))) : []
    };
  });
  const FCTData = {
    typedData,
    builder: this.options.builder || "0x0000000000000000000000000000000000000000",
    typeHash: ethers.utils.hexlify(ethSigUtil.TypedDataUtils.hashType(typedData.primaryType, typedData.types)),
    sessionId,
    nameHash: ethers.utils.id(this.options.name || ""),
    mcall,
    variables: [],
    externalSigners: [],
    signatures: [],
    computed: this.computedVariables
  };
  return FCTData;
}
function importFCT(fct) {
  const options = parseSessionID(fct.sessionId, fct.builder);
  this.setOptions(options);
  const typedData = fct.typedData;
  for (const [index, call] of fct.mcall.entries()) {
    const dataTypes = typedData.types[`transaction${index + 1}`].slice(1);
    const { call: meta } = typedData.message[`transaction_${index + 1}`];
    let params = [];
    if (dataTypes.length > 0) {
      const types = meta.method_interface.slice(meta.method_interface.indexOf("(") + 1, meta.method_interface.lastIndexOf(")")).split(",").map((type, i) => `${type} ${dataTypes[i].name}`);
      const decodedParams = new utils.AbiCoder().decode(types, call.data);
      const handleValue = (value) => {
        if (ethers.BigNumber.isBigNumber(value) || typeof value === "number") {
          return value.toString();
        }
        return value;
      };
      params = dataTypes.map((t, i) => {
        const realType = types[i].split(" ")[0];
        return {
          name: t.name,
          type: t.type,
          hashed: t.type === realType ? false : true,
          value: handleValue(decodedParams[i])
        };
      });
    }
    const getFlow = () => {
      const flow = Object.entries(flows).find(([, value]) => {
        return value.text === meta.flow_control.toString();
      });
      if (!flow) {
        throw new Error("Flow control not found");
      }
      return Flow[flow[0]];
    };
    const callInput = {
      nodeId: `node${index + 1}`,
      to: call.to,
      from: call.from,
      value: call.value,
      method: meta.method_interface.split("(")[0],
      params,
      toENS: meta.to_ens,
      options: {
        gasLimit: meta.gas_limit,
        jumpOnSuccess: meta.jump_on_success === 0 ? "" : `node${index + meta.jump_on_success}`,
        jumpOnFail: meta.jump_on_fail === 0 ? "" : `node${index + meta.jump_on_fail}`,
        flow: getFlow()
      }
    };
    this.create(callInput);
  }
  return this.calls;
}
async function importEncodedFCT(calldata) {
  const ABI = BatchMultiSigCallABI;
  const iface = new ethers.utils.Interface(ABI);
  const chainId = this.chainId;
  const decoded = iface.decodeFunctionData("batchMultiSigCall", calldata);
  const arrayKeys = ["signatures", "mcall"];
  const objectKeys = ["tr"];
  const getFCT = (obj) => {
    return Object.entries(obj).reduce((acc, [key, value]) => {
      if (!isNaN(parseFloat(key))) {
        return acc;
      }
      if (arrayKeys.includes(key)) {
        return {
          ...acc,
          [key]: value.map((sign) => getFCT(sign))
        };
      }
      if (objectKeys.includes(key)) {
        return {
          ...acc,
          [key]: getFCT(value)
        };
      }
      if (key === "callId" || key === "sessionId") {
        return {
          ...acc,
          [key]: "0x" + value.toHexString().slice(2).padStart(64, "0")
        };
      }
      if (key === "types") {
        return {
          ...acc,
          [key]: value.map((type) => type.toString())
        };
      }
      return {
        ...acc,
        [key]: ethers.BigNumber.isBigNumber(value) ? value.toHexString() : value
      };
    }, {});
  };
  const decodedFCT = getFCT(decoded);
  const FCTOptions = parseSessionID(decodedFCT.tr.sessionId, decodedFCT.tr.builder);
  this.setOptions(FCTOptions);
  for (const [index, call] of decodedFCT.tr.mcall.entries()) {
    try {
      const pluginData = kiEthFctProviderTs.getPlugin({
        address: call.to,
        chainId,
        signature: call.functionSignature
      });
      if (!pluginData) {
        throw new Error("Plugin not found");
      }
      const plugin = new pluginData.plugin({
        chainId
      });
      const params = plugin.methodParams;
      const decodedParams = params.length > 0 ? new utils.AbiCoder().decode(
        params.map((type) => `${type.type} ${type.name}`),
        call.data
      ) : [];
      plugin.input.set({
        to: call.to,
        value: parseInt(call.value, 16).toString(),
        methodParams: params.reduce((acc, param) => {
          const getValue = (value2) => {
            const variables = ["0xfb0", "0xfa0", "0xfc00000", "0xfd00000", "0xfdb000"];
            if (ethers.BigNumber.isBigNumber(value2)) {
              const hexString = value2.toHexString();
              if (variables.some((v) => hexString.startsWith(v))) {
                return hexString;
              }
              return value2.toString();
            }
            return value2;
          };
          const value = getValue(decodedParams[param.name]);
          return { ...acc, [param.name]: value };
        }, {})
      });
      const { options } = parseCallID(call.callId);
      const callInput = {
        nodeId: `node${index + 1}`,
        plugin,
        from: call.from,
        options
      };
      await this.create(callInput);
    } catch (e) {
      if (e.message !== "Multiple plugins found for the same signature, can't determine which one to use") {
        throw new Error(`Plugin error for call at index ${index} - ${e.message}`);
      }
      throw new Error(`Plugin not found for call at index ${index}`);
    }
  }
  return this.calls;
}
function setFromAddress(address) {
  this.fromAddress = address;
}

function getAllRequiredApprovals() {
  let requiredApprovals = [];
  if (!this.chainId) {
    throw new Error("No chainId or provider has been set");
  }
  const chainId = this.chainId;
  for (const call of this.calls) {
    if (typeof call.to !== "string") {
      continue;
    }
    const pluginData = kiEthFctProviderTs.getPlugin({
      signature: handleFunctionSignature(call),
      address: call.to,
      chainId
    });
    if (pluginData) {
      const initPlugin = new pluginData.plugin({ chainId });
      const methodParams = call.params ? call.params.reduce((acc, param) => {
        acc[param.name] = param.value;
        return acc;
      }, {}) : {};
      initPlugin.input.set({
        to: call.to,
        methodParams
      });
      const approvals = initPlugin.getRequiredApprovals();
      if (approvals.length > 0 && typeof call.from === "string") {
        const manageValue = (value) => {
          if (value === FCT_VAULT_ADDRESS && typeof call.from === "string") {
            return call.from;
          }
          if (!value) {
            return "";
          }
          return value;
        };
        const requiredApprovalsWithFrom = approvals.filter((approval) => {
          return Object.values(approval).every((value) => typeof value !== "undefined");
        }).map((approval) => {
          return {
            token: approval.to ?? "",
            spender: manageValue(approval.spender),
            requiredAmount: approval.amount ?? "",
            from: approval.from || (typeof call.from === "string" ? call.from : "")
          };
        });
        requiredApprovals = requiredApprovals.concat(requiredApprovalsWithFrom);
      }
    }
  }
  return requiredApprovals;
}
function setOptions(options) {
  const mergedOptions = ___default["default"].merge({ ...this._options }, options);
  verifyOptions(mergedOptions);
  this._options = mergedOptions;
  return this.options;
}
function createTypedData(salt, version) {
  const typedDataMessage = this.strictCalls.reduce((acc, call, index) => {
    let paramsData = {};
    if (call.params) {
      paramsData = this.getParamsFromCall(call, index);
    }
    const options = call.options || {};
    const gasLimit = options.gasLimit ?? "0";
    const flow = options.flow ? flows[options.flow].text : "continue on success, revert on fail";
    let jumpOnSuccess = 0;
    let jumpOnFail = 0;
    if (options.jumpOnSuccess !== NO_JUMP) {
      const jumpOnSuccessIndex = this.calls.findIndex((c) => c.nodeId === options.jumpOnSuccess);
      if (jumpOnSuccessIndex === -1) {
        throw new Error(`Jump on success node id ${options.jumpOnSuccess} not found`);
      }
      if (jumpOnSuccessIndex <= index) {
        throw new Error(
          `Jump on success node id ${options.jumpOnSuccess} is current or before current node (${call.nodeId})`
        );
      }
      jumpOnSuccess = jumpOnSuccessIndex - index - 1;
    }
    if (options.jumpOnFail !== NO_JUMP) {
      const jumpOnFailIndex = this.calls.findIndex((c) => c.nodeId === options.jumpOnFail);
      if (jumpOnFailIndex === -1) {
        throw new Error(`Jump on fail node id ${options.jumpOnFail} not found`);
      }
      if (jumpOnFailIndex <= index) {
        throw new Error(
          `Jump on fail node id ${options.jumpOnFail} is current or before current node (${call.nodeId})`
        );
      }
      jumpOnFail = jumpOnFailIndex - index - 1;
    }
    return {
      ...acc,
      [`transaction_${index + 1}`]: {
        call: {
          call_index: index + 1,
          payer_index: index + 1,
          call_type: call.options?.callType ? CALL_TYPE_MSG[call.options.callType] : CALL_TYPE_MSG.ACTION,
          from: typeof call.from === "string" ? call.from : this.getVariable(call.from, "address"),
          to: this.handleTo(call),
          to_ens: call.toENS || "",
          eth_value: this.handleValue(call),
          gas_limit: gasLimit,
          permissions: 0,
          flow_control: flow,
          returned_false_means_fail: options.falseMeansFail || false,
          jump_on_success: jumpOnSuccess,
          jump_on_fail: jumpOnFail,
          method_interface: handleMethodInterface(call)
        },
        ...paramsData
      }
    };
  }, {});
  const FCTOptions = this.options;
  const { recurrency, multisig } = FCTOptions;
  let optionalMessage = {};
  let optionalTypes = {};
  const primaryType = [];
  if (Number(recurrency.maxRepeats) > 1) {
    optionalMessage = ___default["default"].merge(optionalMessage, {
      recurrency: {
        max_repeats: recurrency.maxRepeats,
        chill_time: recurrency.chillTime,
        accumetable: recurrency.accumetable
      }
    });
    optionalTypes = ___default["default"].merge(optionalTypes, { Recurrency: EIP712_RECURRENCY });
    primaryType.push({ name: "recurrency", type: "Recurrency" });
  }
  if (multisig.externalSigners.length > 0) {
    optionalMessage = ___default["default"].merge(optionalMessage, {
      multisig: {
        external_signers: multisig.externalSigners,
        minimum_approvals: multisig.minimumApprovals || "2"
      }
    });
    optionalTypes = ___default["default"].merge(optionalTypes, { Multisig: EIP712_MULTISIG });
    primaryType.push({ name: "multisig", type: "Multisig" });
  }
  const { structTypes, txTypes } = getTxEIP712Types(this.calls);
  const typedData = {
    types: {
      EIP712Domain: [
        { name: "name", type: "string" },
        { name: "version", type: "string" },
        { name: "chainId", type: "uint256" },
        { name: "verifyingContract", type: "address" },
        { name: "salt", type: "bytes32" }
      ],
      BatchMultiSigCall: [
        { name: "meta", type: "Meta" },
        { name: "limits", type: "Limits" },
        ...primaryType,
        ...this.computedVariables.map((_2, index) => ({
          name: `computed_${index + 1}`,
          type: `Computed`
        })),
        ...this.calls.map((_2, index) => ({
          name: `transaction_${index + 1}`,
          type: `transaction${index + 1}`
        }))
      ],
      Meta: [
        { name: "name", type: "string" },
        { name: "builder", type: "address" },
        { name: "selector", type: "bytes4" },
        { name: "version", type: "bytes3" },
        { name: "random_id", type: "bytes3" },
        { name: "eip712", type: "bool" }
      ],
      Limits: [
        { name: "valid_from", type: "uint40" },
        { name: "expires_at", type: "uint40" },
        { name: "gas_price_limit", type: "uint64" },
        { name: "purgeable", type: "bool" },
        { name: "blockable", type: "bool" }
      ],
      ...optionalTypes,
      ...txTypes,
      ...structTypes,
      ...this.computedVariables.length > 0 ? {
        Computed: [
          { name: "index", type: "uint256" },
          { name: "var", type: "uint256" },
          { name: "add", type: "uint256" },
          { name: "sub", type: "uint256" },
          { name: "mul", type: "uint256" },
          { name: "div", type: "uint256" }
        ]
      } : {},
      Call: [
        { name: "call_index", type: "uint16" },
        { name: "payer_index", type: "uint16" },
        { name: "call_type", type: "string" },
        { name: "from", type: "address" },
        { name: "to", type: "address" },
        { name: "to_ens", type: "string" },
        { name: "eth_value", type: "uint256" },
        { name: "gas_limit", type: "uint32" },
        { name: "permissions", type: "uint16" },
        { name: "flow_control", type: "string" },
        { name: "returned_false_means_fail", type: "bool" },
        { name: "jump_on_success", type: "uint16" },
        { name: "jump_on_fail", type: "uint16" },
        { name: "method_interface", type: "string" }
      ]
    },
    primaryType: "BatchMultiSigCall",
    domain: getTypedDataDomain(this.chainId),
    message: {
      meta: {
        name: this.options.name || "",
        builder: this.options.builder || "0x0000000000000000000000000000000000000000",
        selector: this.batchMultiSigSelector,
        version,
        random_id: `0x${salt}`,
        eip712: true
      },
      limits: {
        valid_from: this.options.validFrom,
        expires_at: this.options.expiresAt,
        gas_price_limit: this.options.maxGasPrice,
        purgeable: this.options.purgeable,
        blockable: this.options.blockable
      },
      ...optionalMessage,
      ...getComputedVariableMessage(this.computedVariables),
      ...typedDataMessage
    }
  };
  return typedData;
}
function getParamsFromCall(call, index) {
  if (call.params) {
    const getParams = (params) => {
      return {
        ...params.reduce((acc, param) => {
          let value;
          if (param.customType || param.type.includes("tuple")) {
            if (param.type.lastIndexOf("[") > 0) {
              const valueArray = param.value;
              value = valueArray.map((item) => getParams(item));
            } else {
              const valueArray = param.value;
              value = getParams(valueArray);
            }
          } else {
            try {
              verifyParam(param);
            } catch (err) {
              if (err instanceof Error) {
                throw new Error(`Error in call ${index + 1}: ${err.message}`);
              }
            }
            if (instanceOfVariable(param.value)) {
              param.value = this.getVariable(param.value, param.type);
            }
            value = param.value;
          }
          return {
            ...acc,
            [param.name]: value
          };
        }, {})
      };
    };
    return getParams(call.params);
  }
  return {};
}
function verifyParams(params) {
  params.forEach((param) => {
    if (instanceOfVariable(param.value)) {
      param.value = this.getVariable(param.value, param.type);
    }
    if (param.customType || param.type.includes("tuple")) {
      if (param.type.lastIndexOf("[") > 0) {
        for (const parameter of param.value) {
          this.verifyParams(parameter);
        }
      } else {
        this.verifyParams(param.value);
      }
    }
  });
}
function handleTo(call) {
  if (typeof call.to === "string") {
    return call.to;
  }
  return this.getVariable(call.to, "address");
}
function handleValue(call) {
  if (!call.value) {
    return "0";
  }
  if (typeof call.value === "string") {
    return call.value;
  }
  return this.getVariable(call.value, "uint256");
}

async function getPlugin(index) {
  const chainId = this.chainId;
  const call = this.getCall(index);
  if (instanceOfVariable(call.to)) {
    throw new Error("To value cannot be a variable");
  }
  const pluginData = kiEthFctProviderTs.getPlugin({
    signature: handleFunctionSignature(call),
    address: call.to,
    chainId
  });
  if (!pluginData) {
    throw new Error("Plugin not found");
  }
  const pluginClass = pluginData.plugin;
  const plugin = new pluginClass({
    chainId: chainId.toString()
  });
  plugin.input.set({
    to: call.to,
    value: call.value,
    methodParams: call.params ? call.params.reduce((acc, param) => {
      return { ...acc, [param.name]: param.value };
    }, {}) : {}
  });
  return plugin;
}
async function getPluginClass(index) {
  const chainId = this.chainId;
  const call = this.getCall(index);
  if (instanceOfVariable(call.to)) {
    throw new Error("To value cannot be a variable");
  }
  const pluginData = kiEthFctProviderTs.getPlugin({
    signature: handleFunctionSignature(call),
    address: call.to,
    chainId: chainId.toString()
  });
  return pluginData;
}
async function getPluginData(index) {
  const plugin = await this.getPlugin(index);
  const call = this.getCall(index);
  return {
    protocol: plugin.protocol,
    type: plugin.type,
    method: plugin.method,
    input: {
      to: call.to,
      value: call.value,
      methodParams: call.params ? call.params.reduce((acc, param) => {
        return { ...acc, [param.name]: param.value };
      }, {}) : {}
    }
  };
}

const BLOCK_NUMBER = "0xFB0A000000000000000000000000000000000000";
const BLOCK_TIMESTAMP = "0xFB0B000000000000000000000000000000000000";
const GAS_PRICE = "0xFB0C000000000000000000000000000000000000";
const MINER_ADDRESS = "0xFA0A000000000000000000000000000000000000";
const ORIGIN_ADDRESS = "0xFA0B000000000000000000000000000000000000";
const INVESTOR_ADDRESS = "0xFA0C000000000000000000000000000000000000";
const ACTIVATOR_ADDRESS = "0xFA0D000000000000000000000000000000000000";
const ENGINE_ADDRESS = "0xFA0E000000000000000000000000000000000000";
const globalVariables = {
  blockNumber: BLOCK_NUMBER,
  blockTimestamp: BLOCK_TIMESTAMP,
  gasPrice: GAS_PRICE,
  minerAddress: MINER_ADDRESS,
  originAddress: ORIGIN_ADDRESS,
  investorAddress: INVESTOR_ADDRESS,
  activatorAddress: ACTIVATOR_ADDRESS,
  engineAddress: ENGINE_ADDRESS
};
const getBlockNumber = () => ({ type: "global", id: "blockNumber" });
const getBlockTimestamp = () => ({ type: "global", id: "blockTimestamp" });
const getGasPrice = () => ({ type: "global", id: "gasPrice" });
const getMinerAddress = () => ({ type: "global", id: "minerAddress" });
const getOriginAddress = () => ({ type: "global", id: "originAddress" });
const getInvestorAddress = () => ({ type: "global", id: "investorAddress" });
const getActivatorAddress = () => ({ type: "global", id: "activatorAddress" });
const getEngineAddress = () => ({ type: "global", id: "engineAddress" });

var index$3 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  globalVariables: globalVariables,
  getBlockNumber: getBlockNumber,
  getBlockTimestamp: getBlockTimestamp,
  getGasPrice: getGasPrice,
  getMinerAddress: getMinerAddress,
  getOriginAddress: getOriginAddress,
  getInvestorAddress: getInvestorAddress,
  getActivatorAddress: getActivatorAddress,
  getEngineAddress: getEngineAddress
});

function getVariable(variable, type) {
  if (variable.type === "external") {
    return this.getExternalVariable(variable.id, type);
  }
  if (variable.type === "output") {
    const id = variable.id;
    const indexForNode = this.calls.findIndex((call) => call.nodeId === id.nodeId);
    return this.getOutputVariable(indexForNode, id.innerIndex, type);
  }
  if (variable.type === "global") {
    const globalVariable = globalVariables[variable.id];
    if (!globalVariable) {
      throw new Error("Global variable not found");
    }
    return globalVariable;
  }
  if (variable.type === "computed") {
    const length = this.computedVariables.push({
      variable: typeof variable.id.variable === "string" ? variable.id.variable : this.getVariable(variable.id.variable, type),
      add: variable.id.add || "",
      sub: variable.id.sub || "",
      mul: variable.id.mul || "",
      div: variable.id.div || ""
    });
    const index = length - 1;
    return this.getComputedVariable(index, type);
  }
  throw new Error("Variable type not found");
}
function getOutputVariable(index, innerIndex, type) {
  const outputIndexHex = (index + 1).toString(16).padStart(4, "0");
  let base;
  let innerIndexHex;
  innerIndex = innerIndex ?? 0;
  if (innerIndex < 0) {
    innerIndexHex = ((innerIndex + 1) * -1).toString(16).padStart(4, "0");
    if (type.includes("bytes")) {
      base = FDBackBaseBytes;
    } else {
      base = FDBackBase;
    }
  } else {
    innerIndexHex = innerIndex.toString(16).padStart(4, "0");
    if (type.includes("bytes")) {
      base = FDBaseBytes;
    } else {
      base = FDBase;
    }
  }
  return (innerIndexHex + outputIndexHex).padStart(base.length, base);
}
function getExternalVariable(index, type) {
  const outputIndexHex = (index + 1).toString(16).padStart(4, "0");
  if (type.includes("bytes")) {
    return outputIndexHex.padStart(FCBaseBytes.length, FCBaseBytes);
  }
  return outputIndexHex.padStart(FCBase.length, FCBase);
}
function getComputedVariable(index, type) {
  const outputIndexHex = (index + 1).toString(16).padStart(4, "0");
  if (type.includes("bytes")) {
    return outputIndexHex.padStart(ComputedBaseBytes.length, ComputedBaseBytes);
  }
  return outputIndexHex.padStart(ComputedBase.length, ComputedBase);
}

class BatchMultiSigCall {
  constructor(input = {}) {
    this.FCT_Controller = new ethers.ethers.utils.Interface(FCTControllerABI);
    this.FCT_BatchMultiSigCall = new ethers.ethers.utils.Interface(BatchMultiSigCallABI);
    this.batchMultiSigSelector = "0x2409a934";
    this.version = "0x010102";
    this.computedVariables = [];
    this.calls = [];
    this._options = {
      maxGasPrice: "30000000000",
      // 30 Gwei as default
      validFrom: getDate(),
      // Valid from now
      expiresAt: getDate(7),
      // Expires after 7 days
      purgeable: false,
      blockable: true,
      builder: "0x0000000000000000000000000000000000000000"
    };
    // Set methods
    this.setOptions = setOptions;
    this.setFromAddress = setFromAddress;
    // Plugin functions
    this.getPlugin = getPlugin;
    this.getPluginClass = getPluginClass;
    this.createPlugin = createPlugin;
    // FCT Functions
    this.create = create;
    this.createWithEncodedData = createWithEncodedData;
    this.createWithPlugin = createWithPlugin;
    this.createMultiple = createMultiple;
    this.exportFCT = exportFCT;
    this.importFCT = importFCT;
    this.importEncodedFCT = importEncodedFCT;
    this.getCall = getCall;
    // Utility functions
    this.getPluginData = getPluginData;
    this.getAllRequiredApprovals = getAllRequiredApprovals;
    // Variables
    this.getVariable = getVariable;
    this.getOutputVariable = getOutputVariable;
    this.getExternalVariable = getExternalVariable;
    this.getComputedVariable = getComputedVariable;
    // Internal helper functions
    this.createTypedData = createTypedData;
    this.getParamsFromCall = getParamsFromCall;
    this.verifyParams = verifyParams;
    this.handleTo = handleTo;
    this.handleValue = handleValue;
    // Validation functions
    this.verifyCall = verifyCall;
    if (input.chainId) {
      this.chainId = input.chainId;
    } else {
      this.chainId = "5";
    }
    if (input.options)
      this.setOptions(input.options);
  }
  // Getters
  get options() {
    return {
      ...this._options,
      name: this._options.name || "",
      recurrency: {
        maxRepeats: this._options.recurrency?.maxRepeats || "1",
        chillTime: this._options.recurrency?.chillTime || "0",
        accumetable: this._options.recurrency?.accumetable || false
      },
      multisig: {
        externalSigners: this._options.multisig?.externalSigners || [],
        minimumApprovals: this._options.multisig?.minimumApprovals || "1"
      }
    };
  }
  get strictCalls() {
    const fromAddress = this.fromAddress;
    return this.calls.map((call) => {
      if (!call.from) {
        if (!fromAddress)
          throw new Error("No from address provided");
        call.from = fromAddress;
      }
      const options = ___default["default"].merge({}, DEFAULT_CALL_OPTIONS, call.options);
      return {
        ...call,
        from: this.fromAddress || call.from,
        value: call.value || "0",
        options
      };
    });
  }
}

function getCalldataForActuator({
  signedFCT,
  purgedFCT,
  investor,
  activator,
  version
}) {
  const FCT_BatchMultiSigCall = new ethers.utils.Interface(BatchMultiSigCallABI);
  return FCT_BatchMultiSigCall.encodeFunctionData("batchMultiSigCall", [
    `0x${version}`.padEnd(66, "0"),
    signedFCT,
    purgedFCT,
    investor,
    activator
  ]);
}

const AUTHENTICATOR_PRIVATE_KEY = "5c35caeef2837c989ca02120f70b439b1f3266b779db6eb38ccabba24a2522b3";
const getAuthenticatorSignature = (typedData) => {
  const signature = ethSigUtil.signTypedData({
    data: typedData,
    privateKey: Buffer.from(AUTHENTICATOR_PRIVATE_KEY, "hex"),
    version: ethSigUtil.SignTypedDataVersion.V4
  });
  return utils.splitSignature(signature);
};

var index$2 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  getCalldataForActuator: getCalldataForActuator,
  getAuthenticatorSignature: getAuthenticatorSignature
});

var index$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  BatchMultiSigCall: BatchMultiSigCall,
  helpers: index$4,
  utils: index$2,
  addresses: addresses,
  EIP712_RECURRENCY: EIP712_RECURRENCY,
  EIP712_MULTISIG: EIP712_MULTISIG,
  NO_JUMP: NO_JUMP,
  DEFAULT_CALL_OPTIONS: DEFAULT_CALL_OPTIONS
});

const transactionValidator = async (txVal, pureGas = false) => {
  const { callData, actuatorContractAddress, actuatorPrivateKey, rpcUrl, activateForFree, gasPrice } = txVal;
  const provider = new ethers.ethers.providers.JsonRpcProvider(rpcUrl);
  const signer = new ethers.ethers.Wallet(actuatorPrivateKey, provider);
  const actuatorContract = new ethers.ethers.Contract(actuatorContractAddress, FCTActuatorABI, signer);
  try {
    let gas;
    if (activateForFree) {
      gas = await actuatorContract.estimateGas.activateForFree(callData, signer.address, {
        ...gasPrice
      });
    } else {
      gas = await actuatorContract.estimateGas.activate(callData, signer.address, {
        ...gasPrice
      });
    }
    const gasUsed = pureGas ? gas.toNumber() : Math.round(gas.toNumber() + gas.toNumber() * 0.2);
    return {
      isValid: true,
      txData: { gas: gasUsed, ...gasPrice, type: 2 },
      prices: { gas: gasUsed, gasPrice: gasPrice.maxFeePerGas },
      error: null
    };
  } catch (err) {
    if (err.reason === "processing response error") {
      throw err;
    }
    return {
      isValid: false,
      txData: { gas: 0, ...gasPrice, type: 2 },
      prices: {
        gas: 0,
        gasPrice: gasPrice.maxFeePerGas
      },
      error: err.reason
    };
  }
};
const getGasPrices = async ({
  rpcUrl,
  historicalBlocks = 10,
  tries = 40
}) => {
  function avg(arr) {
    const sum = arr.reduce((a, v) => a + v);
    return Math.round(sum / arr.length);
  }
  const provider = new ethers.ethers.providers.JsonRpcProvider(rpcUrl);
  let keepTrying = true;
  let returnValue;
  do {
    try {
      const latestBlock = await provider.getBlock("latest");
      if (!latestBlock.baseFeePerGas) {
        throw new Error("No baseFeePerGas");
      }
      const baseFee = latestBlock.baseFeePerGas.toString();
      const blockNumber = latestBlock.number;
      const res = await fetch(rpcUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "eth_feeHistory",
          params: [historicalBlocks, utils.hexlify(blockNumber), [2, 5, 10, 25]],
          id: 1
        })
      });
      const { result } = await res.json();
      if (!result) {
        throw new Error("No result");
      }
      let blockNum = parseInt(result.oldestBlock, 16);
      let index = 0;
      const blocks = [];
      while (blockNum < parseInt(result.oldestBlock, 16) + historicalBlocks) {
        blocks.push({
          number: blockNum,
          baseFeePerGas: Number(result.baseFeePerGas[index]),
          gasUsedRatio: Number(result.gasUsedRatio[index]),
          priorityFeePerGas: result.reward[index].map((x) => Number(x))
        });
        blockNum += 1;
        index += 1;
      }
      const slow = avg(blocks.map((b) => b.priorityFeePerGas[0]));
      const average = avg(blocks.map((b) => b.priorityFeePerGas[1]));
      const fast = avg(blocks.map((b) => b.priorityFeePerGas[2]));
      const fastest = avg(blocks.map((b) => b.priorityFeePerGas[3]));
      const baseFeePerGas = Number(baseFee);
      returnValue = {
        slow: {
          maxFeePerGas: slow + baseFeePerGas,
          maxPriorityFeePerGas: slow
        },
        average: {
          maxFeePerGas: average + baseFeePerGas,
          maxPriorityFeePerGas: average
        },
        fast: {
          maxFeePerGas: fast + baseFeePerGas,
          maxPriorityFeePerGas: fast
        },
        fastest: {
          maxFeePerGas: fastest + baseFeePerGas,
          maxPriorityFeePerGas: fastest
        }
      };
      keepTrying = false;
      return returnValue;
    } catch (err) {
      console.log("Error getting gas prices, retrying", err);
      if (tries > 0) {
        await new Promise((resolve) => setTimeout(resolve, 3e3));
      } else {
        throw new Error("Could not get gas prices, issue might be related to node provider");
      }
    }
  } while (keepTrying && tries-- > 0);
  throw new Error("Could not get gas prices, issue might be related to node provider");
};
const estimateFCTGasCost = async ({
  fct,
  callData,
  batchMultiSigCallAddress,
  rpcUrl
}) => {
  const FCTOverhead = 135500;
  const callOverhead = 16370;
  const numOfCalls = fct.mcall.length;
  const actuator = new ethers.ethers.utils.Interface(FCTActuatorABI);
  const provider = new ethers.ethers.providers.JsonRpcProvider(rpcUrl);
  const batchMultiSigCallContract = new ethers.ethers.Contract(batchMultiSigCallAddress, BatchMultiSigCallABI, provider);
  const chainId = (await provider.getNetwork()).chainId;
  const calcMemory = (input) => {
    return input * 3 + input * input / 512;
  };
  const callDataString = callData.slice(2);
  const callDataArray = callDataString.split("");
  const totalCallDataCost = callDataArray.reduce((accumulator, item) => {
    if (item === "0")
      return accumulator + 4;
    return accumulator + 16;
  }, 21e3);
  const nonZero = callDataArray.reduce((accumulator, item) => {
    if (item !== "0")
      return accumulator + 1;
    return accumulator + 0;
  }, 0);
  const dataLength = actuator.encodeFunctionData("activate", [callData, "0x0000000000000000000000000000000000000000"]).length / 2;
  let totalCallGas = new BigNumber__default["default"](0);
  for (const call of fct.mcall) {
    if (call.types.length > 0) {
      const gasForCall = await batchMultiSigCallContract.estimateGas.abiToEIP712(
        call.data,
        call.types,
        call.typedHashes,
        { data: 0, types: 0 }
      );
      const pluginData = kiEthFctProviderTs.getPlugin({
        address: call.to,
        chainId: chainId.toString(),
        signature: call.functionSignature
      });
      if (pluginData) {
        const gasLimit = new pluginData.plugin({ chainId: chainId.toString() }).gasLimit;
        if (gasLimit) {
          totalCallGas = totalCallGas.plus(gasLimit);
        }
      }
      totalCallGas = totalCallGas.plus(gasForCall.toString());
    }
  }
  const gasEstimation = new BigNumber__default["default"](FCTOverhead).plus(new BigNumber__default["default"](callOverhead).times(numOfCalls)).plus(totalCallDataCost).plus(calcMemory(dataLength)).minus(calcMemory(nonZero)).plus(new BigNumber__default["default"](dataLength).times(600).div(32)).plus(totalCallGas);
  return gasEstimation.toString();
};
const getKIROPayment = ({
  fct,
  kiroPriceInETH,
  gasPrice,
  gas
}) => {
  const vault = fct.typedData.message["transaction_1"].call.from;
  const gasInt = BigInt(gas);
  const gasPriceFormatted = BigInt(gasPrice);
  const limits = fct.typedData.message.limits;
  const maxGasPrice = limits.gas_price_limit;
  const effectiveGasPrice = (gasPriceFormatted * BigInt(1e4 + 1e3) + (BigInt(maxGasPrice) - gasPriceFormatted) * BigInt(5e3)) / BigInt(1e4);
  const feeGasCost = gasInt * (effectiveGasPrice - gasPriceFormatted);
  const baseGasCost = gasInt * gasPriceFormatted;
  const totalCost = baseGasCost + feeGasCost;
  const normalisedKiroPriceInETH = BigInt(kiroPriceInETH);
  const kiroCost = Number(totalCost * normalisedKiroPriceInETH) / 1e36;
  const amountInETH = Number(totalCost) / 1e18;
  return {
    vault,
    amountInKIRO: kiroCost.toString(),
    amountInETH: amountInETH.toString()
  };
};
const getPaymentPerPayer = ({
  fct,
  gasPrice,
  kiroPriceInETH,
  penalty
}) => {
  penalty = penalty || 1;
  const allPaths = getAllFCTPaths(fct);
  fct.signatures = fct.signatures || [];
  const callData = getCalldataForActuator({
    signedFCT: fct,
    activator: "0x0000000000000000000000000000000000000000",
    investor: "0x0000000000000000000000000000000000000000",
    purgedFCT: "0x".padEnd(66, "0"),
    version: "010101"
  });
  const FCTOverhead = 35e3 + 8500 * (fct.mcall.length + 1) + 79e3 * callData.length / 1e4 + 135500;
  const callOverhead = 16370;
  const defaultCallGas = 5e4;
  const limits = fct.typedData.message.limits;
  const maxGasPrice = limits.gas_price_limit;
  const FCTgasPrice = gasPrice ? gasPrice.toString() : maxGasPrice;
  const bigIntGasPrice = BigInt(FCTgasPrice);
  const effectiveGasPrice = ((bigIntGasPrice * BigInt(1e4 + 1e3) + (BigInt(maxGasPrice) - bigIntGasPrice) * BigInt(5e3)) / BigInt(1e4) - bigIntGasPrice).toString();
  const data = allPaths.map((path) => {
    const FCTOverheadPerPayer = (FCTOverhead / path.length).toFixed(0);
    return path.reduce((acc, callIndex) => {
      const call = fct.mcall[Number(callIndex)];
      const callId = parseCallID(call.callId);
      const payerIndex = callId.payerIndex;
      const payer = fct.mcall[payerIndex - 1].from;
      const gasForCall = (BigInt(parseCallID(call.callId).options.gasLimit) || BigInt(defaultCallGas)) - BigInt(21e3);
      const totalGasForCall = BigInt(FCTOverheadPerPayer) + BigInt(callOverhead) + gasForCall;
      const callCost = totalGasForCall * BigInt(FCTgasPrice);
      const callFee = totalGasForCall * BigInt(effectiveGasPrice);
      const totalCallCost = callCost + callFee;
      const kiroCost = new BigNumber__default["default"](totalCallCost.toString()).multipliedBy(new BigNumber__default["default"](kiroPriceInETH)).shiftedBy(-18 - 18).toNumber();
      return {
        ...acc,
        [payer]: BigNumber__default["default"](acc[payer] || 0).plus(kiroCost).toString()
      };
    }, {});
  });
  const allPayers = [
    ...new Set(
      fct.mcall.map((call) => {
        const callId = parseCallID(call.callId);
        const payerIndex = callId.payerIndex;
        const payer = fct.mcall[payerIndex - 1].from;
        return payer;
      })
    )
  ];
  return allPayers.map((payer) => {
    const amount = data.reduce((acc, path) => {
      return BigNumber__default["default"](acc).isGreaterThan(path[payer] || "0") ? acc : path[payer] || "0";
    }, "0");
    return {
      payer,
      amount,
      amountInETH: BigNumber__default["default"](amount).div(BigNumber__default["default"](kiroPriceInETH).shiftedBy(18)).multipliedBy(penalty || 1).toString()
    };
  });
};

var index = /*#__PURE__*/Object.freeze({
  __proto__: null,
  recoverAddressFromEIP712: recoverAddressFromEIP712,
  getFCTMessageHash: getFCTMessageHash,
  validateFCT: validateFCT,
  getVariablesAsBytes32: getVariablesAsBytes32,
  getAllFCTPaths: getAllFCTPaths,
  fetchCurrentApprovals: fetchCurrentApprovals,
  transactionValidator: transactionValidator,
  getGasPrices: getGasPrices,
  estimateFCTGasCost: estimateFCTGasCost,
  getKIROPayment: getKIROPayment,
  getPaymentPerPayer: getPaymentPerPayer
});

Object.defineProperty(exports, 'pluginUtils', {
  enumerable: true,
  get: function () { return kiEthFctProviderTs.utils; }
});
Object.defineProperty(exports, 'ethers', {
  enumerable: true,
  get: function () { return ethers.ethers; }
});
exports.BatchMultiSigCall = BatchMultiSigCall;
exports.FCTBatchMultiSigCall = index$1;
exports.constants = index$5;
exports.utils = index;
exports.variables = index$3;
Object.keys(kiEthFctProviderTs).forEach(function (k) {
  if (k !== 'default' && !exports.hasOwnProperty(k)) Object.defineProperty(exports, k, {
    enumerable: true,
    get: function () { return kiEthFctProviderTs[k]; }
  });
});
