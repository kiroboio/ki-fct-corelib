import { getPlugin as getPlugin$1 } from '@kirobo/ki-eth-fct-provider-ts';
export * from '@kirobo/ki-eth-fct-provider-ts';
export { utils as pluginUtils } from '@kirobo/ki-eth-fct-provider-ts';
import { utils, ethers, BigNumber as BigNumber$1 } from 'ethers';
export { ethers } from 'ethers';
import { TypedDataUtils, recoverTypedSignature, SignTypedDataVersion, signTypedData } from '@metamask/eth-sig-util';
import { Graph } from 'graphlib';
import BigNumber from 'bignumber.js';
import { isAddress as isAddress$1, toUtf8Bytes, defaultAbiCoder, AbiCoder, splitSignature, hexlify } from 'ethers/lib/utils';
import _ from 'lodash';

var Flow;
(function (Flow) {
    Flow["OK_CONT_FAIL_REVERT"] = "OK_CONT_FAIL_REVERT";
    Flow["OK_CONT_FAIL_STOP"] = "OK_CONT_FAIL_STOP";
    Flow["OK_CONT_FAIL_CONT"] = "OK_CONT_FAIL_CONT";
    Flow["OK_REVERT_FAIL_CONT"] = "OK_REVERT_FAIL_CONT";
    Flow["OK_REVERT_FAIL_STOP"] = "OK_REVERT_FAIL_STOP";
    Flow["OK_STOP_FAIL_CONT"] = "OK_STOP_FAIL_CONT";
    Flow["OK_STOP_FAIL_REVERT"] = "OK_STOP_FAIL_REVERT";
    Flow["OK_STOP_FAIL_STOP"] = "OK_STOP_FAIL_STOP";
})(Flow || (Flow = {}));
var flows = {
    OK_CONT_FAIL_REVERT: {
        text: "continue on success, revert on fail",
        value: "0",
    },
    OK_CONT_FAIL_STOP: {
        text: "continue on success, stop on fail",
        value: "1",
    },
    OK_CONT_FAIL_CONT: {
        text: "continue on success, continue on fail",
        value: "2",
    },
    OK_REVERT_FAIL_CONT: {
        text: "revert on success, continue on fail",
        value: "3",
    },
    OK_REVERT_FAIL_STOP: {
        text: "revert on success, stop on fail",
        value: "4",
    },
    OK_STOP_FAIL_CONT: {
        text: "stop on success, continue on fail",
        value: "5",
    },
    OK_STOP_FAIL_REVERT: {
        text: "stop on success, revert on fail",
        value: "6",
    },
    OK_STOP_FAIL_STOP: {
        text: "stop on success, stop on fail",
        value: "7",
    },
};

var multicallContracts = {
    1: "0xeefBa1e63905eF1D7ACbA5a8513c70307C1cE441",
    5: "0x77dCa2C955b15e9dE4dbBCf1246B4B85b651e50e",
};
var nullValue = "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470";
var FCBase = "0xFC00000000000000000000000000000000000000";
var FCBaseBytes = "0xFC00000000000000000000000000000000000000000000000000000000000000";
var FDBase = "0xFD00000000000000000000000000000000000000";
var FDBaseBytes = "0xFD00000000000000000000000000000000000000000000000000000000000000";
var FDBackBase = "0xFDB0000000000000000000000000000000000000";
var FDBackBaseBytes = "0xFDB0000000000000000000000000000000000000000000000000000000000000";
var ComputedBase = "0xFE00000000000000000000000000000000000000";
var ComputedBaseBytes = "0xFE00000000000000000000000000000000000000000000000000000000000000";
var CALL_TYPE = {
    ACTION: "0",
    VIEW_ONLY: "1",
    LIBRARY: "2",
};
var CALL_TYPE_MSG = {
    ACTION: "action",
    VIEW_ONLY: "view only",
    LIBRARY: "library",
};
var FCT_VAULT_ADDRESS = "FCT_VAULT_ADDRESS";

var index$5 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    get Flow () { return Flow; },
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

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function __generator(thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
}

function __values(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
}

function __read(o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
}

function __spreadArray(to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
}

var mustBeInteger = ["validFrom", "expiresAt", "maxGasPrice", "maxRepeats", "chillTime", "minimumApprovals"];
var mustBeAddress = ["builder"];
// Validate Integer values in options
var validateInteger = function (value, keys) {
    var currentKey = keys[keys.length - 1];
    if (value.includes(".")) {
        throw new Error("Options: ".concat(keys.join("."), " cannot be a decimal"));
    }
    if (value.startsWith("-")) {
        throw new Error("Options: ".concat(keys.join("."), " cannot be negative"));
    }
    if (currentKey === "maxRepeats" && Number(value) < 1) {
        throw new Error("Options: ".concat(keys.join("."), " should be at least 1. If value is 1, recurrency will not be enabled in order to save gas"));
    }
};
// Validate address values in options
var validateAddress = function (value, keys) {
    if (!isAddress$1(value)) {
        throw new Error("Options: ".concat(keys.join("."), " is not a valid address"));
    }
};
var validateOptionsValues = function (value, parentKeys) {
    if (parentKeys === void 0) { parentKeys = []; }
    if (!value) {
        return;
    }
    Object.keys(value).forEach(function (key) {
        var objKey = key;
        if (typeof value[objKey] === "object") {
            validateOptionsValues(value[objKey], __spreadArray(__spreadArray([], __read(parentKeys), false), [objKey], false));
        }
        // Integer validator
        if (mustBeInteger.includes(objKey)) {
            validateInteger(value[objKey], __spreadArray(__spreadArray([], __read(parentKeys), false), [objKey], false));
        }
        // Address validator
        if (mustBeAddress.includes(objKey)) {
            validateAddress(value[objKey], __spreadArray(__spreadArray([], __read(parentKeys), false), [objKey], false));
        }
        // Expires at validator
        if (objKey === "expiresAt") {
            var expiresAt = Number(value[objKey]);
            var now = Number(new Date().getTime() / 1000).toFixed();
            var validFrom = value.validFrom;
            if (BigNumber(expiresAt).isLessThanOrEqualTo(now)) {
                throw new Error("Options: expiresAt must be in the future");
            }
            if (validFrom && BigNumber(expiresAt).isLessThanOrEqualTo(validFrom)) {
                throw new Error("Options: expiresAt must be greater than validFrom");
            }
        }
    });
};
var verifyOptions = function (options) {
    validateOptionsValues(options);
};
var verifyParam = function (param) {
    if (!param.value) {
        throw new Error("Param ".concat(param.name, " is missing a value"));
    }
    if (typeof param.value !== "string") {
        return;
    }
    // uint value
    if (param.type.startsWith("uint")) {
        if (param.value.includes(".")) {
            throw new Error("Param ".concat(param.name, " cannot be a decimal"));
        }
        if (param.value.startsWith("-")) {
            throw new Error("Param ".concat(param.name, " cannot be negative"));
        }
    }
    // int value
    if (param.type.startsWith("int")) {
        if (param.value.includes(".")) {
            throw new Error("Param ".concat(param.name, " cannot be a decimal"));
        }
    }
    // address
    if (param.type === "address") {
        if (!isAddress$1(param.value)) {
            throw new Error("Param ".concat(param.name, " is not a valid address"));
        }
    }
    // bytes
    if (param.type.startsWith("bytes")) {
        if (!param.value.startsWith("0x")) {
            throw new Error("Param ".concat(param.name, " is not a valid bytes value"));
        }
    }
};

// Create a function that checks if the param type last index of [ is greater than 0. If true - value is Param[][] else - value is Param[]
var isInstanceOfTupleArray = function (value, param) {
    var _a;
    return ((_a = param.customType) !== null && _a !== void 0 ? _a : false) && param.type.lastIndexOf("[") > 0;
};
var isInstanceOfTuple = function (value, param) {
    var _a;
    return ((_a = param.customType) !== null && _a !== void 0 ? _a : false) && param.type.lastIndexOf("[") === -1;
};
var getTxEIP712Types = function (calls) {
    var txTypes = {};
    var structTypes = {};
    var getTypeCount = function () { return Object.values(structTypes).length + 1; };
    var getStructType = function (param, index) {
        var e_1, _a, e_2, _b;
        var typeName = "Struct".concat(getTypeCount());
        var paramValue;
        if (isInstanceOfTupleArray(param.value, param)) {
            paramValue = param.value[0];
        }
        else if (isInstanceOfTuple(param.value, param)) {
            paramValue = param.value;
        }
        else {
            throw new Error("Invalid param value: ".concat(param.value, " for param: ").concat(param.name));
        }
        var customCount = 0;
        var eip712Type = paramValue.map(function (item) {
            if (item.customType || item.type.includes("tuple")) {
                ++customCount;
                var innerTypeName = "Struct".concat(getTypeCount() + customCount);
                return {
                    name: item.name,
                    type: innerTypeName,
                };
            }
            return {
                name: item.name,
                type: item.type,
            };
        });
        structTypes[typeName] = eip712Type;
        if (param.type.lastIndexOf("[") > 0) {
            try {
                for (var _c = __values(param.value[0]), _d = _c.next(); !_d.done; _d = _c.next()) {
                    var parameter = _d.value;
                    if (parameter.customType || parameter.type.includes("tuple")) {
                        getStructType(parameter, index);
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
                }
                finally { if (e_1) throw e_1.error; }
            }
        }
        else {
            try {
                for (var _e = __values(param.value), _f = _e.next(); !_f.done; _f = _e.next()) {
                    var parameter = _f.value;
                    if (parameter.customType || parameter.type.includes("tuple")) {
                        getStructType(parameter, index);
                    }
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
                }
                finally { if (e_2) throw e_2.error; }
            }
        }
        return typeName;
    };
    calls.forEach(function (call, index) {
        var values = call.params
            ? call.params.map(function (param) {
                if (param.customType || param.type === "tuple") {
                    var type = getStructType(param, index);
                    return { name: param.name, type: type };
                }
                return {
                    name: param.name,
                    type: param.type,
                };
            })
            : [];
        txTypes["transaction".concat(index + 1)] = __spreadArray([{ name: "call", type: "Call" }], __read(values), false);
    });
    return {
        txTypes: txTypes,
        structTypes: structTypes,
    };
};
var getUsedStructTypes = function (typedData, typeName) {
    var mainType = typedData.types[typeName];
    var usedStructTypes = mainType.reduce(function (acc, item) {
        if (item.type.includes("Struct")) {
            return __spreadArray(__spreadArray(__spreadArray([], __read(acc), false), [item.type], false), __read(getUsedStructTypes(typedData, item.type)), false);
        }
        return acc;
    }, []);
    return usedStructTypes;
};
var getComputedVariableMessage = function (computedVariables) {
    return computedVariables.reduce(function (acc, item, i) {
        var _a;
        return __assign(__assign({}, acc), (_a = {}, _a["computed_".concat(i + 1)] = {
            index: (i + 1).toString(),
            var: item.variable,
            add: item.add,
            sub: item.sub,
            mul: item.mul,
            div: item.div,
        }, _a));
    }, {});
};

var instanceOfVariable = function (object) {
    return typeof object === "object" && "type" in object && "id" in object;
};
function instanceOfParams(objectOrArray) {
    if (Array.isArray(objectOrArray)) {
        return instanceOfParams(objectOrArray[0]);
    }
    return typeof objectOrArray === "object" && "type" in objectOrArray && "name" in objectOrArray;
}

// From method and params create tuple
var getMethodInterface = function (call) {
    var getParamsType = function (param) {
        if (instanceOfParams(param.value)) {
            if (Array.isArray(param.value[0])) {
                var value = param.value[0];
                return "(".concat(value.map(getParamsType).join(","), ")[]");
            }
            else {
                var value = param.value;
                return "(".concat(value.map(getParamsType).join(","), ")");
            }
        }
        return param.hashed ? "bytes32" : param.type;
    };
    var params = call.params ? call.params.map(getParamsType) : "";
    return "".concat(call.method, "(").concat(params, ")");
};
var getEncodedMethodParams = function (call, withFunction) {
    if (!call.method)
        return "0x";
    if (withFunction) {
        var ABI = [
            "function ".concat(call.method, "(").concat(call.params ? call.params.map(function (item) { return (item.hashed ? "bytes32" : item.type); }).join(",") : "", ")"),
        ];
        var iface = new utils.Interface(ABI);
        return iface.encodeFunctionData(call.method, call.params
            ? call.params.map(function (item) {
                if (item.hashed) {
                    if (typeof item.value === "string") {
                        return utils.keccak256(toUtf8Bytes(item.value));
                    }
                    throw new Error("Hashed value must be a string");
                }
                return item.value;
            })
            : []);
    }
    var getType = function (param) {
        if (param.customType || param.type.includes("tuple")) {
            var value = void 0;
            var isArray = false;
            if (param.type.lastIndexOf("[") > 0) {
                isArray = true;
                value = param.value[0];
            }
            else {
                value = param.value;
            }
            return "(".concat(value.map(getType).join(","), ")").concat(isArray ? "[]" : "");
        }
        return param.hashed ? "bytes32" : param.type;
    };
    var getValues = function (param) {
        if (!param.value) {
            throw new Error("Param value is required");
        }
        if (param.customType || param.type.includes("tuple")) {
            var value = void 0;
            if (param.type.lastIndexOf("[") > 0) {
                value = param.value;
                return value.reduce(function (acc, val) {
                    return __spreadArray(__spreadArray([], __read(acc), false), [val.map(getValues)], false);
                }, []);
            }
            else {
                value = param.value;
                return value.map(getValues);
            }
        }
        if (param.hashed) {
            if (typeof param.value === "string") {
                return utils.keccak256(toUtf8Bytes(param.value));
            }
            throw new Error("Hashed value must be a string");
        }
        return param.value;
    };
    if (!call.params)
        return "0x";
    return defaultAbiCoder.encode(call.params.map(getType), call.params.map(getValues));
};

function getDate(days) {
    if (days === void 0) { days = 0; }
    var result = new Date();
    result.setDate(result.getDate() + days);
    return Number(result.getTime() / 1000).toFixed();
}

var TYPE_NATIVE = 1000;
var TYPE_STRING = 2000;
var TYPE_BYTES = 3000;
var TYPE_ARRAY = 4000;
var TYPE_ARRAY_WITH_LENGTH = 5000;
var typeValue = function (param) {
    // If type is an array
    if (param.type.lastIndexOf("[") > 0 && !param.hashed) {
        if (param.customType || param.type.includes("tuple")) {
            var value = param.value;
            return __spreadArray([TYPE_ARRAY, value.length], __read(getTypesArray(param.value[0])), false);
        }
        var parameter = __assign(__assign({}, param), { type: param.type.slice(0, param.type.lastIndexOf("[")) });
        var insideType = typeValue(parameter);
        var type = param.type.indexOf("]") - param.type.indexOf("[") === 1 ? TYPE_ARRAY : TYPE_ARRAY_WITH_LENGTH;
        return __spreadArray([type], __read(insideType), false);
    }
    // If type is a string
    if (param.type === "string" && !param.hashed) {
        return [TYPE_STRING];
    }
    // If type is bytes
    if (param.type === "bytes" && !param.hashed) {
        return [TYPE_BYTES];
    }
    // If param is custom struct
    if (param.customType || param.type.includes("tuple")) {
        var values = param.value;
        var types = values.reduce(function (acc, item) {
            return __spreadArray(__spreadArray([], __read(acc), false), __read(typeValue(item)), false);
        }, []);
        return __spreadArray([values.length], __read(types), false);
    }
    // If all statements above are false, then type is a native type
    return [TYPE_NATIVE];
};
// Get Types array
var getTypesArray = function (params) {
    var types = params.reduce(function (acc, item) {
        var data = typeValue(item);
        return __spreadArray(__spreadArray([], __read(acc), false), __read(data), false);
    }, []);
    if (!types.some(function (item) { return item !== TYPE_NATIVE; })) {
        return [];
    }
    return types;
};
var getTypedHashes = function (params, typedData) {
    return params.reduce(function (acc, item) {
        if (item.customType) {
            var type = item.type.lastIndexOf("[") > 0 ? item.type.slice(0, item.type.lastIndexOf("[")) : item.type;
            return __spreadArray(__spreadArray([], __read(acc), false), [utils.hexlify(utils.hexlify(TypedDataUtils.hashType(type, typedData.types)))], false);
        }
        return acc;
    }, []);
};

var handleMethodInterface = function (call) {
    if (call.method) {
        return getMethodInterface(call);
    }
    return "";
};
var handleFunctionSignature = function (call) {
    if (call.method) {
        var value = getMethodInterface(call);
        return utils.id(value);
    }
    return nullValue;
};
var handleEnsHash = function (call) {
    if (call.toENS) {
        return utils.id(call.toENS);
    }
    return nullValue;
};
var handleData = function (call) {
    return getEncodedMethodParams(call);
};
var handleTypes = function (call) {
    if (call.params) {
        return getTypesArray(call.params);
    }
    return [];
};
var handleTypedHashes = function (call, typedData) {
    if (call.params) {
        return getTypedHashes(call.params, typedData);
    }
    return [];
};

var addresses = {
    1: {
        // NOTE: These addresses are not correct since no contracts have been deployed on mainnet
        // TODO: Update these addresses once contracts have been deployed on mainnet
        FCT_Controller: "0x087550a787B2720AAC06351065afC1F413D82572",
        FCT_BatchMultiSig: "0x067D176d13651c8AfF7964a4bB9dF3107F893e88",
        FCT_EnsManager: "0x7DA33a8606BF2F752D473238ff8681b53cf30976",
        FCT_Tokenomics: "0xFE4fEC781Bd626751249ABb1b15375f3370B9c79",
        Actuator: "0x6B271aEa169B4804D1d709B2687c17c3Cc8E2e56",
        ActuatorCore: "0xC76b674d3e33cd908055F295c945F1cd575b7df2",
    },
    5: {
        FCT_Controller: "0x087550a787B2720AAC06351065afC1F413D82572",
        FCT_BatchMultiSig: "0x067D176d13651c8AfF7964a4bB9dF3107F893e88",
        FCT_EnsManager: "0x7DA33a8606BF2F752D473238ff8681b53cf30976",
        FCT_Tokenomics: "0xFE4fEC781Bd626751249ABb1b15375f3370B9c79",
        Actuator: "0x6B271aEa169B4804D1d709B2687c17c3Cc8E2e56",
        ActuatorCore: "0xC76b674d3e33cd908055F295c945F1cd575b7df2",
    },
};
var EIP712_RECURRENCY = [
    { name: "max_repeats", type: "uint16" },
    { name: "chill_time", type: "uint32" },
    { name: "accumetable", type: "bool" },
];
var EIP712_MULTISIG = [
    { name: "external_signers", type: "address[]" },
    { name: "minimum_approvals", type: "uint8" },
];
var NO_JUMP = "NO_JUMP";
var DEFAULT_CALL_OPTIONS = {
    permissions: "0000",
    gasLimit: "0",
    flow: Flow.OK_CONT_FAIL_REVERT,
    jumpOnSuccess: NO_JUMP,
    jumpOnFail: NO_JUMP,
    falseMeansFail: false,
    callType: "ACTION",
};

var valueWithPadStart = function (value, padStart) {
    return Number(value).toString(16).padStart(padStart, "0");
};
var manageCallId = function (calls, call, index) {
    // This is the structure of callId string
    // 4 - Permissions
    // 2 - Flow
    // 4 - Fail Jump
    // 4 - Ok Jump
    // 4 - Payer index
    // 4 - Call index
    // 8 - Gas limit
    // 2 - Flags
    // 0x00000000000000000000000000000000 / 0000 / 05 / 0000 / 0001 / 0001 / 0001 / 00000000 / 00;
    var permissions = "0000";
    var flow = valueWithPadStart(flows[call.options.flow].value, 2);
    var payerIndex = valueWithPadStart(index + 1, 4);
    var callIndex = valueWithPadStart(index + 1, 4);
    var gasLimit = valueWithPadStart(call.options.gasLimit, 8);
    var flags = function () {
        var callType = CALL_TYPE[call.options.callType];
        var falseMeansFail = call.options.falseMeansFail ? 4 : 0;
        return callType + (parseInt(callType, 16) + falseMeansFail).toString(16);
    };
    var successJump = "0000";
    var failJump = "0000";
    if (call.options) {
        if (call.options.jumpOnFail !== NO_JUMP) {
            var nodeIndex = calls.findIndex(function (c) { var _a; return c.nodeId === ((_a = call === null || call === void 0 ? void 0 : call.options) === null || _a === void 0 ? void 0 : _a.jumpOnFail); });
            failJump = Number(nodeIndex - index - 1)
                .toString(16)
                .padStart(4, "0");
        }
        if (call.options.jumpOnSuccess !== NO_JUMP) {
            var nodeIndex = calls.findIndex(function (c) { var _a; return c.nodeId === ((_a = call === null || call === void 0 ? void 0 : call.options) === null || _a === void 0 ? void 0 : _a.jumpOnSuccess); });
            successJump = Number(nodeIndex - index - 1)
                .toString(16)
                .padStart(4, "0");
        }
    }
    return ("0x" +
        "".concat(permissions).concat(flow).concat(failJump).concat(successJump).concat(payerIndex).concat(callIndex).concat(gasLimit).concat(flags()).padStart(64, "0"));
};
// Deconstructed sessionID
// 6 - Salt
// 2 - External signers
// 6 - Version
// 4 - Max Repeats
// 8 - Chill time
// 10 - After timestamp
// 10 - Before timestamp
// 16 - Gas price limit
// 2 - Flags
var getSessionId = function (salt, versionHex, options) {
    var _a;
    var currentDate = new Date();
    var recurrency = options.recurrency, multisig = options.multisig;
    if (options.expiresAt && Number(options.expiresAt) < currentDate.getTime() / 1000) {
        throw new Error("Expires at date cannot be in the past");
    }
    var minimumApprovals = multisig.externalSigners.length > 0
        ? Number(options.multisig.minimumApprovals).toString(16).padStart(2, "0")
        : "00";
    var version = versionHex.slice(2);
    var maxRepeats = Number(recurrency.maxRepeats) > 1 ? Number(options.recurrency.maxRepeats).toString(16).padStart(4, "0") : "0000";
    var chillTime = Number(recurrency.maxRepeats) > 0 ? Number(options.recurrency.chillTime).toString(16).padStart(8, "0") : "00000000";
    var beforeTimestamp = Number(options.expiresAt).toString(16).padStart(10, "0");
    var afterTimestamp = Number(options.validFrom).toString(16).padStart(10, "0");
    var maxGasPrice = Number(options.maxGasPrice).toString(16).padStart(16, "0");
    var flagValue = 8; // EIP712 true by default
    if ((_a = options.recurrency) === null || _a === void 0 ? void 0 : _a.accumetable)
        flagValue += 1;
    if (options.purgeable)
        flagValue += 2;
    if (options.blockable)
        flagValue += 4;
    var flags = flagValue.toString(16).padStart(2, "0");
    return "0x".concat(salt).concat(minimumApprovals).concat(version).concat(maxRepeats).concat(chillTime).concat(beforeTimestamp).concat(afterTimestamp).concat(maxGasPrice).concat(flags);
};
var parseSessionID = function (sessionId, builder) {
    // const salt = sessionId.slice(2, 8);
    var minimumApprovals = parseInt(sessionId.slice(8, 10), 16).toString();
    // const version = sessionId.slice(10, 16);
    var maxRepeats = parseInt(sessionId.slice(16, 20), 16).toString();
    var chillTime = parseInt(sessionId.slice(20, 28), 16).toString();
    var expiresAt = parseInt(sessionId.slice(28, 38), 16).toString();
    var validFrom = parseInt(sessionId.slice(38, 48), 16).toString();
    var maxGasPrice = parseInt(sessionId.slice(48, 64), 16).toString();
    var flagsNumber = parseInt(sessionId.slice(64, 66), 16);
    var flags = {
        eip712: true,
        accumetable: false,
        purgeable: false,
        blockable: false,
    };
    if (flagsNumber === 9) {
        flags = __assign(__assign({}, flags), { accumetable: true });
    }
    else if (flagsNumber === 10) {
        flags = __assign(__assign({}, flags), { purgeable: true });
    }
    else if (flagsNumber === 11) {
        flags = __assign(__assign({}, flags), { accumetable: true, purgeable: true });
    }
    else if (flagsNumber === 12) {
        flags = __assign(__assign({}, flags), { blockable: true });
    }
    else if (flagsNumber === 13) {
        flags = __assign(__assign({}, flags), { accumetable: true, blockable: true });
    }
    else if (flagsNumber === 14) {
        flags = __assign(__assign({}, flags), { purgeable: true, blockable: true });
    }
    else if (flagsNumber === 15) {
        flags = __assign(__assign({}, flags), { accumetable: true, purgeable: true, blockable: true });
    }
    var data = {
        validFrom: validFrom,
        expiresAt: expiresAt,
        maxGasPrice: maxGasPrice,
        blockable: flags.blockable,
        purgeable: flags.purgeable,
    };
    var recurrency = {};
    recurrency.accumetable = flags.accumetable;
    if (maxRepeats !== "0")
        recurrency.maxRepeats = maxRepeats;
    if (chillTime !== "0")
        recurrency.chillTime = chillTime;
    var multisig = {};
    if (minimumApprovals !== "0")
        multisig.minimumApprovals = minimumApprovals;
    return __assign(__assign({}, data), { builder: builder, recurrency: recurrency, multisig: multisig });
};
var parseCallID = function (callId, jumpsAsNumbers) {
    if (jumpsAsNumbers === void 0) { jumpsAsNumbers = false; }
    var permissions = callId.slice(36, 38);
    var flowNumber = parseInt(callId.slice(38, 40), 16);
    var jumpOnFail = parseInt(callId.slice(40, 44), 16);
    var jumpOnSuccess = parseInt(callId.slice(44, 48), 16);
    var payerIndex = parseInt(callId.slice(48, 52), 16);
    var callIndex = parseInt(callId.slice(52, 56), 16);
    var gasLimit = parseInt(callId.slice(56, 64), 16).toString();
    var flags = parseInt(callId.slice(64, 66), 16);
    var getFlow = function () {
        var flow = Object.entries(flows).find(function (_a) {
            var _b = __read(_a, 2), value = _b[1];
            return value.value === flowNumber.toString();
        });
        if (!flow)
            throw new Error("Invalid flow");
        return Flow[flow[0]];
    };
    var options = {
        gasLimit: gasLimit,
        flow: getFlow(),
        jumpOnFail: 0,
        jumpOnSuccess: 0,
    };
    if (jumpsAsNumbers) {
        options["jumpOnFail"] = jumpOnFail;
        options["jumpOnSuccess"] = jumpOnSuccess;
    }
    else {
        if (jumpOnFail)
            options["jumpOnFail"] = "node".concat(callIndex + jumpOnFail);
        if (jumpOnSuccess)
            options["jumpOnSuccess"] = "node".concat(callIndex + jumpOnFail);
    }
    return {
        options: options,
        viewOnly: flags === 1,
        permissions: permissions,
        payerIndex: payerIndex,
        callIndex: callIndex,
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
    var validKeys = [
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
    validKeys.forEach(function (key) {
        if (!keys.includes(key)) {
            throw new Error("FCT missing key ".concat(key));
        }
    });
}
var recoverAddressFromEIP712 = function (typedData, signature) {
    try {
        var signatureString = utils.joinSignature(signature);
        var address = recoverTypedSignature({
            data: typedData,
            version: SignTypedDataVersion.V4,
            signature: signatureString,
        });
        return address;
    }
    catch (e) {
        return null;
    }
};
var getFCTMessageHash = function (typedData) {
    return ethers.utils.hexlify(TypedDataUtils.eip712Hash(typedData, SignTypedDataVersion.V4));
};
var validateFCT = function (FCT, softValidation) {
    if (softValidation === void 0) { softValidation = false; }
    var keys = Object.keys(FCT);
    validateFCTKeys(keys);
    var limits = FCT.typedData.message.limits;
    var fctData = FCT.typedData.message.meta;
    var currentDate = new Date().getTime() / 1000;
    var validFrom = parseInt(limits.valid_from);
    var expiresAt = parseInt(limits.expires_at);
    var gasPriceLimit = limits.gas_price_limit;
    if (!softValidation && validFrom > currentDate) {
        throw new Error("FCT is not valid yet. FCT is valid from ".concat(validFrom));
    }
    if (expiresAt < currentDate) {
        throw new Error("FCT has expired. FCT expired at ".concat(expiresAt));
    }
    if (gasPriceLimit === "0") {
        throw new Error("FCT gas price limit cannot be 0");
    }
    if (!fctData.eip712) {
        throw new Error("FCT must be type EIP712");
    }
    return {
        getOptions: function () {
            var parsedSessionID = parseSessionID(FCT.sessionId, fctData.builder);
            return {
                valid_from: parsedSessionID.validFrom,
                expires_at: parsedSessionID.expiresAt,
                gas_price_limit: parsedSessionID.maxGasPrice,
                blockable: parsedSessionID.blockable,
                purgeable: parsedSessionID.purgeable,
                builder: parsedSessionID.builder,
                recurrency: parsedSessionID.recurrency,
                multisig: parsedSessionID.multisig,
            };
        },
        getFCTMessageHash: function () { return getFCTMessageHash(FCT.typedData); },
        getSigners: function () {
            return FCT.mcall.reduce(function (acc, _a) {
                var from = _a.from;
                if (!acc.includes(from)) {
                    acc.push(from);
                }
                return acc;
            }, []);
        },
    };
};
var getVariablesAsBytes32 = function (variables) {
    return variables.map(function (v) {
        if (isNaN(Number(v)) || utils.isAddress(v)) {
            return "0x".concat(String(v).replace("0x", "").padStart(64, "0"));
        }
        return "0x".concat(Number(v).toString(16).padStart(64, "0"));
    });
};
var getAllFCTPaths = function (fct) {
    var g = new Graph({ directed: true });
    fct.mcall.forEach(function (_, index) {
        g.setNode(index.toString());
    });
    for (var i = 0; i < fct.mcall.length - 1; i++) {
        var callID = parseCallID(fct.mcall[i].callId, true);
        var jumpOnSuccess = callID.options.jumpOnSuccess;
        var jumpOnFail = callID.options.jumpOnFail;
        if (jumpOnSuccess === jumpOnFail) {
            g.setEdge(i.toString(), (i + 1 + Number(jumpOnSuccess)).toString());
        }
        else {
            g.setEdge(i.toString(), (i + 1 + Number(jumpOnSuccess)).toString());
            g.setEdge(i.toString(), (i + 1 + Number(jumpOnFail)).toString());
        }
    }
    var allPaths = [];
    var isVisited = {};
    var pathList = [];
    var start = "0";
    var end = (fct.mcall.length - 1).toString();
    pathList.push(start);
    var printAllPathsUtil = function (g, start, end, isVisited, localPathList) {
        var e_1, _a;
        if (start === end) {
            var path = localPathList.slice();
            allPaths.push(path);
            return;
        }
        isVisited[start] = true;
        var successors = g.successors(start);
        if (successors === undefined) {
            successors = [];
        }
        try {
            for (var _b = __values(successors), _c = _b.next(); !_c.done; _c = _b.next()) {
                var id = _c.value;
                if (!isVisited[id]) {
                    // store current node
                    // in path[]
                    localPathList.push(id);
                    printAllPathsUtil(g, id, end, isVisited, localPathList);
                    // remove current node
                    // in path[]
                    localPathList.splice(localPathList.indexOf(id), 1);
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        isVisited[start] = false;
    };
    printAllPathsUtil(g, start, end, isVisited, pathList);
    return allPaths;
};

var fetchCurrentApprovals = function (_a) {
    var rpcUrl = _a.rpcUrl, provider = _a.provider, data = _a.data;
    return __awaiter(void 0, void 0, void 0, function () {
        var chainId, multiCallContract, calls, _b, returnData, approvals;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!provider) {
                        if (!rpcUrl) {
                            throw new Error("No provider or rpcUrl provided");
                        }
                        provider = new ethers.providers.JsonRpcProvider(rpcUrl);
                    }
                    return [4 /*yield*/, provider.getNetwork()];
                case 1:
                    chainId = (_c.sent()).chainId.toString();
                    if (!multicallContracts[Number(chainId)]) {
                        throw new Error("Multicall contract not found for this chain");
                    }
                    multiCallContract = new ethers.Contract(multicallContracts[Number(chainId)], [
                        "function aggregate((address target, bytes callData)[] calls) external view returns (uint256 blockNumber, bytes[] returnData)",
                    ], provider);
                    calls = data.map(function (approval) {
                        return {
                            target: approval.token,
                            callData: new ethers.utils.Interface([
                                "function allowance(address owner, address spender) view returns (uint256)",
                            ]).encodeFunctionData("allowance", [approval.from, approval.spender]),
                        };
                    });
                    return [4 /*yield*/, multiCallContract.callStatic.aggregate(calls)];
                case 2:
                    _b = __read.apply(void 0, [_c.sent(), 2]), returnData = _b[1];
                    approvals = returnData.map(function (appr, index) {
                        var decoded = utils.defaultAbiCoder.decode(["uint256"], appr);
                        return __assign(__assign({}, data[index]), { value: decoded[0].toString() });
                    });
                    return [2 /*return*/, approvals];
            }
        });
    });
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

var isInteger = function (value, key) {
    if (value.length === 0) {
        throw new Error("".concat(key, " cannot be empty string"));
    }
    if (value.startsWith("-")) {
        throw new Error("".concat(key, " cannot be negative"));
    }
    if (value.includes(".")) {
        throw new Error("".concat(key, " cannot be a decimal"));
    }
};
var isAddress = function (value, key) {
    if (value.length === 0) {
        throw new Error("".concat(key, " address cannot be empty string"));
    }
    if (!utils.isAddress(value)) {
        throw new Error("".concat(key, " address is not a valid address"));
    }
};
function verifyCall(call) {
    // To address validator
    if (!call.to) {
        throw new Error("To address is required");
    }
    else if (typeof call.to === "string") {
        isAddress(call.to, "To");
    }
    // // From address validator
    // if (!call.from) {
    //   throw new Error("From address is required");
    // } else if (typeof call.from === "string") {
    //   isAddress(call.from, "From");
    // }
    // Value validator
    if (call.value && typeof call.value === "string") {
        isInteger(call.value, "Value");
    }
    // Method validator
    if (call.method && call.method.length === 0) {
        throw new Error("Method cannot be empty string");
    }
    // Node ID validator
    if (call.nodeId) {
        var index = this.calls.findIndex(function (item) { return item.nodeId === call.nodeId; });
        if (index > 0) {
            throw new Error("Node ID ".concat(call.nodeId, " already exists, please use a different one"));
        }
    }
    // Options validator
    if (call.options) {
        var _a = call.options, gasLimit = _a.gasLimit, callType = _a.callType;
        if (gasLimit && typeof gasLimit === "string") {
            isInteger(gasLimit, "Gas limit");
        }
        if (callType) {
            var keysOfCALLTYPE = Object.keys(CALL_TYPE);
            if (!keysOfCALLTYPE.includes(callType)) {
                throw new Error("Call type ".concat(callType, " is not valid"));
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

// const getSaltBuffer = (salt: string) => new Uint8Array(Buffer.from(salt.slice(2), "hex"));
// TODO: Change salt to be a buffer
var TYPED_DATA_DOMAIN = {
    "1": {
        name: "FCT Controller",
        version: "1",
        chainId: 1,
        verifyingContract: "0x087550a787B2720AAC06351065afC1F413D82572",
        // salt: getSaltBuffer("0x01005fc59cf4781ce0b30000087550a787b2720aac06351065afc1f413d82572"),
        salt: "0x01005fc59cf4781ce0b30000087550a787b2720aac06351065afc1f413d82572",
    },
    "5": {
        name: "FCT Controller",
        version: "1",
        chainId: 5,
        verifyingContract: "0x087550a787B2720AAC06351065afC1F413D82572",
        // salt: getSaltBuffer("0x01005fc59cf4781ce0b30000087550a787b2720aac06351065afc1f413d82572"),
        salt: "0x01005fc59cf4781ce0b30000087550a787b2720aac06351065afc1f413d82572",
    },
};
var getTypedDataDomain = function (chainId) {
    return TYPED_DATA_DOMAIN[chainId];
};
var getParamsFromInputs = function (inputs, values) {
    return inputs.map(function (input) {
        if (input.type === "tuple") {
            return {
                name: input.name,
                type: input.type,
                customType: true,
                value: getParamsFromInputs(input.components, values[input.name]),
            };
        }
        if (input.type === "tuple[]") {
            return {
                name: input.name,
                type: input.type,
                customType: true,
                value: values[input.name].map(function (tuple) { return getParamsFromInputs(input.components, tuple); }),
            };
        }
        return {
            name: input.name,
            type: input.type,
            value: values[input.name],
        };
    });
};

// Generate nodeId for a call
function generateNodeId() {
    return __spreadArray([], __read(Array(6)), false).map(function () { return Math.floor(Math.random() * 16).toString(16); }).join("");
}
function create(callInput) {
    return __awaiter(this, void 0, void 0, function () {
        var data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!("plugin" in callInput)) return [3 /*break*/, 2];
                    return [4 /*yield*/, this.createWithPlugin(callInput)];
                case 1: return [2 /*return*/, _a.sent()];
                case 2:
                    if (!("abi" in callInput)) return [3 /*break*/, 4];
                    return [4 /*yield*/, this.createWithEncodedData(callInput)];
                case 3: return [2 /*return*/, _a.sent()];
                case 4:
                    data = __assign(__assign({}, callInput), { nodeId: callInput.nodeId || generateNodeId() });
                    // Before adding the call, we check if it is valid
                    this.verifyCall(data);
                    this.calls.push(data);
                    return [2 /*return*/, data];
            }
        });
    });
}
function createMultiple(calls) {
    return __awaiter(this, void 0, void 0, function () {
        var callsCreated, _a, _b, _c, index, call, createdCall, err_1, e_1_1;
        var e_1, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    callsCreated = [];
                    _e.label = 1;
                case 1:
                    _e.trys.push([1, 8, 9, 10]);
                    _a = __values(calls.entries()), _b = _a.next();
                    _e.label = 2;
                case 2:
                    if (!!_b.done) return [3 /*break*/, 7];
                    _c = __read(_b.value, 2), index = _c[0], call = _c[1];
                    _e.label = 3;
                case 3:
                    _e.trys.push([3, 5, , 6]);
                    return [4 /*yield*/, this.create(call)];
                case 4:
                    createdCall = _e.sent();
                    callsCreated.push(createdCall);
                    return [3 /*break*/, 6];
                case 5:
                    err_1 = _e.sent();
                    if (err_1 instanceof Error) {
                        throw new Error("Error creating call ".concat(index + 1, ": ").concat(err_1.message));
                    }
                    return [3 /*break*/, 6];
                case 6:
                    _b = _a.next();
                    return [3 /*break*/, 2];
                case 7: return [3 /*break*/, 10];
                case 8:
                    e_1_1 = _e.sent();
                    e_1 = { error: e_1_1 };
                    return [3 /*break*/, 10];
                case 9:
                    try {
                        if (_b && !_b.done && (_d = _a.return)) _d.call(_a);
                    }
                    finally { if (e_1) throw e_1.error; }
                    return [7 /*endfinally*/];
                case 10: return [2 /*return*/, this.calls];
            }
        });
    });
}
function createWithPlugin(callWithPlugin) {
    return __awaiter(this, void 0, void 0, function () {
        var pluginCall, data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, callWithPlugin.plugin.create()];
                case 1:
                    pluginCall = _a.sent();
                    if (pluginCall === undefined) {
                        throw new Error("Error creating call with plugin. Make sure input values are valid");
                    }
                    data = __assign(__assign({}, pluginCall), { from: callWithPlugin.from, options: __assign(__assign({}, pluginCall.options), callWithPlugin.options), nodeId: callWithPlugin.nodeId || generateNodeId() });
                    // Before adding the call, we check if it is valid
                    this.verifyCall(data);
                    this.calls.push(data);
                    return [2 /*return*/, data];
            }
        });
    });
}
function createWithEncodedData(callWithEncodedData) {
    return __awaiter(this, void 0, void 0, function () {
        var value, encodedData, abi, options, nodeId, iface, _a, name, args, txValue, inputs, data;
        return __generator(this, function (_b) {
            value = callWithEncodedData.value, encodedData = callWithEncodedData.encodedData, abi = callWithEncodedData.abi, options = callWithEncodedData.options, nodeId = callWithEncodedData.nodeId;
            iface = new ethers.utils.Interface(abi);
            _a = iface.parseTransaction({
                data: encodedData,
                value: typeof value === "string" ? value : "0",
            }), name = _a.name, args = _a.args, txValue = _a.value, inputs = _a.functionFragment.inputs;
            data = {
                from: callWithEncodedData.from,
                to: callWithEncodedData.to,
                method: name,
                params: getParamsFromInputs(inputs, args),
                options: options,
                value: txValue === null || txValue === void 0 ? void 0 : txValue.toString(),
                nodeId: nodeId || generateNodeId(),
            };
            // Before adding the call, we check if it is valid
            this.verifyCall(data);
            this.calls.push(data);
            return [2 /*return*/, data];
        });
    });
}
function createPlugin(Plugin) {
    return new Plugin({
        chainId: this.chainId,
    });
}
function getCall(index) {
    if (index < 0 || index >= this.calls.length) {
        throw new Error("Index out of range");
    }
    return this.calls[index];
}
function exportFCT() {
    var _this = this;
    this.computedVariables = [];
    var calls = this.strictCalls;
    if (this.calls.length === 0) {
        throw new Error("No calls added");
    }
    verifyOptions(this._options);
    var salt = __spreadArray([], __read(Array(6)), false).map(function () { return Math.floor(Math.random() * 16).toString(16); }).join("");
    var typedData = this.createTypedData(salt, this.version);
    var sessionId = getSessionId(salt, this.version, this.options);
    var mcall = calls.map(function (call, index) {
        var usedTypeStructs = getUsedStructTypes(typedData, "transaction".concat(index + 1));
        return {
            typeHash: utils.hexlify(TypedDataUtils.hashType("transaction".concat(index + 1), typedData.types)),
            ensHash: handleEnsHash(call),
            functionSignature: handleFunctionSignature(call),
            value: _this.handleValue(call),
            callId: manageCallId(_this.calls, call, index),
            from: typeof call.from === "string" ? call.from : _this.getVariable(call.from, "address"),
            to: _this.handleTo(call),
            data: handleData(call),
            types: handleTypes(call),
            typedHashes: usedTypeStructs.length > 0
                ? usedTypeStructs.map(function (hash) { return utils.hexlify(TypedDataUtils.hashType(hash, typedData.types)); })
                : [],
        };
    });
    var FCTData = {
        typedData: typedData,
        builder: this.options.builder || "0x0000000000000000000000000000000000000000",
        typeHash: utils.hexlify(TypedDataUtils.hashType(typedData.primaryType, typedData.types)),
        sessionId: sessionId,
        nameHash: utils.id(this.options.name || ""),
        mcall: mcall,
        variables: [],
        externalSigners: [],
        signatures: [],
        computed: this.computedVariables,
    };
    return FCTData;
}
function importFCT(fct) {
    var e_2, _a;
    // Here we import FCT and add all the data inside BatchMultiSigCall
    var options = parseSessionID(fct.sessionId, fct.builder);
    this.setOptions(options);
    var typedData = fct.typedData;
    var _loop_1 = function (index, call) {
        var dataTypes = typedData.types["transaction".concat(index + 1)].slice(1);
        var meta = typedData.message["transaction_".concat(index + 1)].call;
        var params = [];
        if (dataTypes.length > 0) {
            // Getting types from method_interface, because parameter might be hashed and inside
            // EIP712 types it will be indicated as "string", but actually it is meant to be "bytes32"
            var types_1 = meta.method_interface
                .slice(meta.method_interface.indexOf("(") + 1, meta.method_interface.lastIndexOf(")"))
                .split(",")
                .map(function (type, i) { return "".concat(type, " ").concat(dataTypes[i].name); });
            var decodedParams_1 = new AbiCoder().decode(types_1, call.data);
            var handleValue_1 = function (value) {
                if (BigNumber$1.isBigNumber(value) || typeof value === "number") {
                    return value.toString();
                }
                return value;
            };
            params = dataTypes.map(function (t, i) {
                var realType = types_1[i].split(" ")[0];
                return {
                    name: t.name,
                    type: t.type,
                    hashed: t.type === realType ? false : true,
                    value: handleValue_1(decodedParams_1[i]),
                };
            });
        }
        var getFlow = function () {
            var flow = Object.entries(flows).find(function (_a) {
                var _b = __read(_a, 2), value = _b[1];
                return value.text === meta.flow_control.toString();
            });
            if (!flow) {
                throw new Error("Flow control not found");
            }
            return Flow[flow[0]];
        };
        var callInput = {
            nodeId: "node".concat(index + 1),
            to: call.to,
            from: call.from,
            value: call.value,
            method: meta.method_interface.split("(")[0],
            params: params,
            toENS: meta.to_ens,
            options: {
                gasLimit: meta.gas_limit,
                jumpOnSuccess: meta.jump_on_success === 0 ? "" : "node".concat(index + meta.jump_on_success),
                jumpOnFail: meta.jump_on_fail === 0 ? "" : "node".concat(index + meta.jump_on_fail),
                flow: getFlow(),
            },
        };
        this_1.create(callInput);
    };
    var this_1 = this;
    try {
        for (var _b = __values(fct.mcall.entries()), _c = _b.next(); !_c.done; _c = _b.next()) {
            var _d = __read(_c.value, 2), index = _d[0], call = _d[1];
            _loop_1(index, call);
        }
    }
    catch (e_2_1) { e_2 = { error: e_2_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
        }
        finally { if (e_2) throw e_2.error; }
    }
    return this.calls;
}
function importEncodedFCT(calldata) {
    return __awaiter(this, void 0, void 0, function () {
        var ABI, iface, chainId, decoded, arrayKeys, objectKeys, getFCT, decodedFCT, FCTOptions, _loop_2, this_2, _a, _b, _c, index, call, e_3_1;
        var e_3, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    ABI = BatchMultiSigCallABI;
                    iface = new utils.Interface(ABI);
                    chainId = this.chainId;
                    decoded = iface.decodeFunctionData("batchMultiSigCall", calldata);
                    arrayKeys = ["signatures", "mcall"];
                    objectKeys = ["tr"];
                    getFCT = function (obj) {
                        return Object.entries(obj).reduce(function (acc, _a) {
                            var _b, _c, _d, _e, _f;
                            var _g = __read(_a, 2), key = _g[0], value = _g[1];
                            if (!isNaN(parseFloat(key))) {
                                return acc;
                            }
                            if (arrayKeys.includes(key)) {
                                return __assign(__assign({}, acc), (_b = {}, _b[key] = value.map(function (sign) { return getFCT(sign); }), _b));
                            }
                            if (objectKeys.includes(key)) {
                                return __assign(__assign({}, acc), (_c = {}, _c[key] = getFCT(value), _c));
                            }
                            if (key === "callId" || key === "sessionId") {
                                return __assign(__assign({}, acc), (_d = {}, _d[key] = "0x" + value.toHexString().slice(2).padStart(64, "0"), _d));
                            }
                            if (key === "types") {
                                return __assign(__assign({}, acc), (_e = {}, _e[key] = value.map(function (type) { return type.toString(); }), _e));
                            }
                            return __assign(__assign({}, acc), (_f = {}, _f[key] = BigNumber$1.isBigNumber(value) ? value.toHexString() : value, _f));
                        }, {});
                    };
                    decodedFCT = getFCT(decoded);
                    FCTOptions = parseSessionID(decodedFCT.tr.sessionId, decodedFCT.tr.builder);
                    this.setOptions(FCTOptions);
                    _loop_2 = function (index, call) {
                        var pluginData, plugin, params, decodedParams_2, options, callInput, e_4;
                        return __generator(this, function (_f) {
                            switch (_f.label) {
                                case 0:
                                    _f.trys.push([0, 2, , 3]);
                                    pluginData = getPlugin$1({
                                        address: call.to,
                                        chainId: chainId,
                                        signature: call.functionSignature,
                                    });
                                    if (!pluginData) {
                                        throw new Error("Plugin not found");
                                    }
                                    plugin = new pluginData.plugin({
                                        chainId: chainId,
                                    });
                                    params = plugin.methodParams;
                                    decodedParams_2 = params.length > 0
                                        ? new AbiCoder().decode(params.map(function (type) { return "".concat(type.type, " ").concat(type.name); }), call.data)
                                        : [];
                                    plugin.input.set({
                                        to: call.to,
                                        value: parseInt(call.value, 16).toString(),
                                        methodParams: params.reduce(function (acc, param) {
                                            var _a;
                                            var getValue = function (value) {
                                                var variables = ["0xfb0", "0xfa0", "0xfc00000", "0xfd00000", "0xfdb000"];
                                                if (BigNumber$1.isBigNumber(value)) {
                                                    var hexString_1 = value.toHexString();
                                                    if (variables.some(function (v) { return hexString_1.startsWith(v); })) {
                                                        return hexString_1;
                                                    }
                                                    return value.toString();
                                                }
                                                return value;
                                            };
                                            var value = getValue(decodedParams_2[param.name]);
                                            return __assign(__assign({}, acc), (_a = {}, _a[param.name] = value, _a));
                                        }, {}),
                                    });
                                    options = parseCallID(call.callId).options;
                                    callInput = {
                                        nodeId: "node".concat(index + 1),
                                        plugin: plugin,
                                        from: call.from,
                                        options: options,
                                    };
                                    return [4 /*yield*/, this_2.create(callInput)];
                                case 1:
                                    _f.sent();
                                    return [3 /*break*/, 3];
                                case 2:
                                    e_4 = _f.sent();
                                    if (e_4.message !== "Multiple plugins found for the same signature, can't determine which one to use") {
                                        throw new Error("Plugin error for call at index ".concat(index, " - ").concat(e_4.message));
                                    }
                                    throw new Error("Plugin not found for call at index ".concat(index));
                                case 3: return [2 /*return*/];
                            }
                        });
                    };
                    this_2 = this;
                    _e.label = 1;
                case 1:
                    _e.trys.push([1, 6, 7, 8]);
                    _a = __values(decodedFCT.tr.mcall.entries()), _b = _a.next();
                    _e.label = 2;
                case 2:
                    if (!!_b.done) return [3 /*break*/, 5];
                    _c = __read(_b.value, 2), index = _c[0], call = _c[1];
                    return [5 /*yield**/, _loop_2(index, call)];
                case 3:
                    _e.sent();
                    _e.label = 4;
                case 4:
                    _b = _a.next();
                    return [3 /*break*/, 2];
                case 5: return [3 /*break*/, 8];
                case 6:
                    e_3_1 = _e.sent();
                    e_3 = { error: e_3_1 };
                    return [3 /*break*/, 8];
                case 7:
                    try {
                        if (_b && !_b.done && (_d = _a.return)) _d.call(_a);
                    }
                    finally { if (e_3) throw e_3.error; }
                    return [7 /*endfinally*/];
                case 8: return [2 /*return*/, this.calls];
            }
        });
    });
}
function setFromAddress(address) {
    this.fromAddress = address;
}

function getAllRequiredApprovals() {
    var e_1, _a;
    var requiredApprovals = [];
    if (!this.chainId) {
        throw new Error("No chainId or provider has been set");
    }
    var chainId = this.chainId;
    var _loop_1 = function (call) {
        if (typeof call.to !== "string") {
            return "continue";
        }
        var pluginData = getPlugin$1({
            signature: handleFunctionSignature(call),
            address: call.to,
            chainId: chainId,
        });
        if (pluginData) {
            var initPlugin = new pluginData.plugin({ chainId: chainId });
            var methodParams = call.params
                ? call.params.reduce(function (acc, param) {
                    acc[param.name] = param.value;
                    return acc;
                }, {})
                : {};
            initPlugin.input.set({
                to: call.to,
                methodParams: methodParams,
            });
            var approvals = initPlugin.getRequiredApprovals();
            if (approvals.length > 0 && typeof call.from === "string") {
                var manageValue_1 = function (value) {
                    if (value === FCT_VAULT_ADDRESS && typeof call.from === "string") {
                        return call.from;
                    }
                    if (!value) {
                        return "";
                    }
                    return value;
                };
                var requiredApprovalsWithFrom = approvals
                    .filter(function (approval) {
                    return Object.values(approval).every(function (value) { return typeof value !== "undefined"; });
                })
                    .map(function (approval) {
                    var _a, _b;
                    return {
                        token: (_a = approval.to) !== null && _a !== void 0 ? _a : "",
                        spender: manageValue_1(approval.spender),
                        requiredAmount: (_b = approval.amount) !== null && _b !== void 0 ? _b : "",
                        from: approval.from || (typeof call.from === "string" ? call.from : ""),
                    };
                });
                requiredApprovals = requiredApprovals.concat(requiredApprovalsWithFrom);
            }
        }
    };
    try {
        for (var _b = __values(this.calls), _c = _b.next(); !_c.done; _c = _b.next()) {
            var call = _c.value;
            _loop_1(call);
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return requiredApprovals;
}
function setOptions(options) {
    var mergedOptions = _.merge(__assign({}, this._options), options);
    verifyOptions(mergedOptions);
    this._options = mergedOptions;
    return this.options;
}
function createTypedData(salt, version) {
    var _this = this;
    var typedDataMessage = this.strictCalls.reduce(function (acc, call, index) {
        var _a;
        var _b, _c;
        var paramsData = {};
        if (call.params) {
            paramsData = _this.getParamsFromCall(call, index);
        }
        var options = call.options || {};
        var gasLimit = (_b = options.gasLimit) !== null && _b !== void 0 ? _b : "0";
        var flow = options.flow ? flows[options.flow].text : "continue on success, revert on fail";
        var jumpOnSuccess = 0;
        var jumpOnFail = 0;
        if (options.jumpOnSuccess !== NO_JUMP) {
            var jumpOnSuccessIndex = _this.calls.findIndex(function (c) { return c.nodeId === options.jumpOnSuccess; });
            if (jumpOnSuccessIndex === -1) {
                throw new Error("Jump on success node id ".concat(options.jumpOnSuccess, " not found"));
            }
            if (jumpOnSuccessIndex <= index) {
                throw new Error("Jump on success node id ".concat(options.jumpOnSuccess, " is current or before current node (").concat(call.nodeId, ")"));
            }
            jumpOnSuccess = jumpOnSuccessIndex - index - 1;
        }
        if (options.jumpOnFail !== NO_JUMP) {
            var jumpOnFailIndex = _this.calls.findIndex(function (c) { return c.nodeId === options.jumpOnFail; });
            if (jumpOnFailIndex === -1) {
                throw new Error("Jump on fail node id ".concat(options.jumpOnFail, " not found"));
            }
            if (jumpOnFailIndex <= index) {
                throw new Error("Jump on fail node id ".concat(options.jumpOnFail, " is current or before current node (").concat(call.nodeId, ")"));
            }
            jumpOnFail = jumpOnFailIndex - index - 1;
        }
        return __assign(__assign({}, acc), (_a = {}, _a["transaction_".concat(index + 1)] = __assign({ call: {
                call_index: index + 1,
                payer_index: index + 1,
                call_type: ((_c = call.options) === null || _c === void 0 ? void 0 : _c.callType) ? CALL_TYPE_MSG[call.options.callType] : CALL_TYPE_MSG.ACTION,
                from: typeof call.from === "string" ? call.from : _this.getVariable(call.from, "address"),
                to: _this.handleTo(call),
                to_ens: call.toENS || "",
                eth_value: _this.handleValue(call),
                gas_limit: gasLimit,
                permissions: 0,
                flow_control: flow,
                returned_false_means_fail: options.falseMeansFail || false,
                jump_on_success: jumpOnSuccess,
                jump_on_fail: jumpOnFail,
                method_interface: handleMethodInterface(call),
            } }, paramsData), _a));
    }, {});
    var FCTOptions = this.options;
    var recurrency = FCTOptions.recurrency, multisig = FCTOptions.multisig;
    var optionalMessage = {};
    var optionalTypes = {};
    var primaryType = [];
    if (Number(recurrency.maxRepeats) > 1) {
        optionalMessage = _.merge(optionalMessage, {
            recurrency: {
                max_repeats: recurrency.maxRepeats,
                chill_time: recurrency.chillTime,
                accumetable: recurrency.accumetable,
            },
        });
        optionalTypes = _.merge(optionalTypes, { Recurrency: EIP712_RECURRENCY });
        primaryType.push({ name: "recurrency", type: "Recurrency" });
    }
    if (multisig.externalSigners.length > 0) {
        optionalMessage = _.merge(optionalMessage, {
            multisig: {
                external_signers: multisig.externalSigners,
                minimum_approvals: multisig.minimumApprovals || "2",
            },
        });
        optionalTypes = _.merge(optionalTypes, { Multisig: EIP712_MULTISIG });
        primaryType.push({ name: "multisig", type: "Multisig" });
    }
    var _a = getTxEIP712Types(this.calls), structTypes = _a.structTypes, txTypes = _a.txTypes;
    var typedData = {
        types: __assign(__assign(__assign(__assign(__assign({ EIP712Domain: [
                { name: "name", type: "string" },
                { name: "version", type: "string" },
                { name: "chainId", type: "uint256" },
                { name: "verifyingContract", type: "address" },
                { name: "salt", type: "bytes32" },
            ], BatchMultiSigCall: __spreadArray(__spreadArray(__spreadArray([
                { name: "meta", type: "Meta" },
                { name: "limits", type: "Limits" }
            ], __read(primaryType), false), __read(this.computedVariables.map(function (_, index) { return ({
                name: "computed_".concat(index + 1),
                type: "Computed",
            }); })), false), __read(this.calls.map(function (_, index) { return ({
                name: "transaction_".concat(index + 1),
                type: "transaction".concat(index + 1),
            }); })), false), Meta: [
                { name: "name", type: "string" },
                { name: "builder", type: "address" },
                { name: "selector", type: "bytes4" },
                { name: "version", type: "bytes3" },
                { name: "random_id", type: "bytes3" },
                { name: "eip712", type: "bool" },
            ], Limits: [
                { name: "valid_from", type: "uint40" },
                { name: "expires_at", type: "uint40" },
                { name: "gas_price_limit", type: "uint64" },
                { name: "purgeable", type: "bool" },
                { name: "blockable", type: "bool" },
            ] }, optionalTypes), txTypes), structTypes), (this.computedVariables.length > 0
            ? {
                Computed: [
                    { name: "index", type: "uint256" },
                    { name: "var", type: "uint256" },
                    { name: "add", type: "uint256" },
                    { name: "sub", type: "uint256" },
                    { name: "mul", type: "uint256" },
                    { name: "div", type: "uint256" },
                ],
            }
            : {})), { Call: [
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
                { name: "method_interface", type: "string" },
            ] }),
        primaryType: "BatchMultiSigCall",
        domain: getTypedDataDomain(this.chainId),
        message: __assign(__assign(__assign({ meta: {
                name: this.options.name || "",
                builder: this.options.builder || "0x0000000000000000000000000000000000000000",
                selector: this.batchMultiSigSelector,
                version: version,
                random_id: "0x".concat(salt),
                eip712: true,
            }, limits: {
                valid_from: this.options.validFrom,
                expires_at: this.options.expiresAt,
                gas_price_limit: this.options.maxGasPrice,
                purgeable: this.options.purgeable,
                blockable: this.options.blockable,
            } }, optionalMessage), getComputedVariableMessage(this.computedVariables)), typedDataMessage),
    };
    return typedData;
}
function getParamsFromCall(call, index) {
    var _this = this;
    // If call has parameters
    if (call.params) {
        var getParams_1 = function (params) {
            return __assign({}, params.reduce(function (acc, param) {
                var _a;
                var value;
                // If parameter is a custom type (struct)
                if (param.customType || param.type.includes("tuple")) {
                    // If parameter is an array of custom types
                    if (param.type.lastIndexOf("[") > 0) {
                        var valueArray = param.value;
                        value = valueArray.map(function (item) { return getParams_1(item); });
                    }
                    else {
                        // If parameter is a custom type
                        var valueArray = param.value;
                        value = getParams_1(valueArray);
                    }
                }
                else {
                    try {
                        verifyParam(param);
                    }
                    catch (err) {
                        if (err instanceof Error) {
                            throw new Error("Error in call ".concat(index + 1, ": ").concat(err.message));
                        }
                    }
                    if (instanceOfVariable(param.value)) {
                        param.value = _this.getVariable(param.value, param.type);
                    }
                    value = param.value;
                }
                return __assign(__assign({}, acc), (_a = {}, _a[param.name] = value, _a));
            }, {}));
        };
        return getParams_1(call.params);
    }
    return {};
}
function verifyParams(params) {
    var _this = this;
    params.forEach(function (param) {
        // If parameter is a variable
        var e_2, _a;
        if (instanceOfVariable(param.value)) {
            param.value = _this.getVariable(param.value, param.type);
        }
        if (param.customType || param.type.includes("tuple")) {
            if (param.type.lastIndexOf("[") > 0) {
                try {
                    for (var _b = __values(param.value), _c = _b.next(); !_c.done; _c = _b.next()) {
                        var parameter = _c.value;
                        _this.verifyParams(parameter);
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                    }
                    finally { if (e_2) throw e_2.error; }
                }
            }
            else {
                _this.verifyParams(param.value);
            }
        }
    });
}
function handleTo(call) {
    if (typeof call.to === "string") {
        return call.to;
    }
    // Else it is a variable
    return this.getVariable(call.to, "address");
}
function handleValue(call) {
    // If value isn't provided => 0
    if (!call.value) {
        return "0";
    }
    // Check if value is a number
    if (typeof call.value === "string") {
        return call.value;
    }
    // Else it is a variable
    return this.getVariable(call.value, "uint256");
}

function getPlugin(index) {
    return __awaiter(this, void 0, void 0, function () {
        var chainId, call, pluginData, pluginClass, plugin;
        return __generator(this, function (_a) {
            chainId = this.chainId;
            call = this.getCall(index);
            if (instanceOfVariable(call.to)) {
                throw new Error("To value cannot be a variable");
            }
            pluginData = getPlugin$1({
                signature: handleFunctionSignature(call),
                address: call.to,
                chainId: chainId,
            });
            if (!pluginData) {
                throw new Error("Plugin not found");
            }
            pluginClass = pluginData.plugin;
            plugin = new pluginClass({
                chainId: chainId.toString(),
            });
            plugin.input.set({
                to: call.to,
                value: call.value,
                methodParams: call.params
                    ? call.params.reduce(function (acc, param) {
                        var _a;
                        return __assign(__assign({}, acc), (_a = {}, _a[param.name] = param.value, _a));
                    }, {})
                    : {},
            });
            return [2 /*return*/, plugin];
        });
    });
}
function getPluginClass(index) {
    return __awaiter(this, void 0, void 0, function () {
        var chainId, call, pluginData;
        return __generator(this, function (_a) {
            chainId = this.chainId;
            call = this.getCall(index);
            if (instanceOfVariable(call.to)) {
                throw new Error("To value cannot be a variable");
            }
            pluginData = getPlugin$1({
                signature: handleFunctionSignature(call),
                address: call.to,
                chainId: chainId.toString(),
            });
            return [2 /*return*/, pluginData];
        });
    });
}
function getPluginData(index) {
    return __awaiter(this, void 0, void 0, function () {
        var plugin, call;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, this.getPlugin(index)];
                case 1:
                    plugin = _a.sent();
                    call = this.getCall(index);
                    return [2 /*return*/, {
                            protocol: plugin.protocol,
                            type: plugin.type,
                            method: plugin.method,
                            input: {
                                to: call.to,
                                value: call.value,
                                methodParams: call.params
                                    ? call.params.reduce(function (acc, param) {
                                        var _a;
                                        return __assign(__assign({}, acc), (_a = {}, _a[param.name] = param.value, _a));
                                    }, {})
                                    : {},
                            },
                        }];
            }
        });
    });
}

var BLOCK_NUMBER = "0xFB0A000000000000000000000000000000000000";
var BLOCK_TIMESTAMP = "0xFB0B000000000000000000000000000000000000";
var GAS_PRICE = "0xFB0C000000000000000000000000000000000000";
var MINER_ADDRESS = "0xFA0A000000000000000000000000000000000000";
var ORIGIN_ADDRESS = "0xFA0B000000000000000000000000000000000000";
var INVESTOR_ADDRESS = "0xFA0C000000000000000000000000000000000000";
var ACTIVATOR_ADDRESS = "0xFA0D000000000000000000000000000000000000";
var ENGINE_ADDRESS = "0xFA0E000000000000000000000000000000000000";
// const BLOCK_HASH = "0xFF00000000000000000000000000000000000000";
// const getBlockHash = (indexOfPreviousBlock: number = 1) => {
//   if (indexOfPreviousBlock === 0) {
//     throw new Error("Only previous blocks are supported");
//   }
//   if (indexOfPreviousBlock > 255) {
//     throw new Error("Only previous blocks up to 255 are supported");
//   }
//   return (indexOfPreviousBlock - 1).toString(16).padStart(BLOCK_HASH.length, BLOCK_HASH);
// };
var globalVariables = {
    blockNumber: BLOCK_NUMBER,
    blockTimestamp: BLOCK_TIMESTAMP,
    gasPrice: GAS_PRICE,
    minerAddress: MINER_ADDRESS,
    originAddress: ORIGIN_ADDRESS,
    investorAddress: INVESTOR_ADDRESS,
    activatorAddress: ACTIVATOR_ADDRESS,
    engineAddress: ENGINE_ADDRESS,
};
var getBlockNumber = function () { return ({ type: "global", id: "blockNumber" }); };
var getBlockTimestamp = function () { return ({ type: "global", id: "blockTimestamp" }); };
var getGasPrice = function () { return ({ type: "global", id: "gasPrice" }); };
var getMinerAddress = function () { return ({ type: "global", id: "minerAddress" }); };
var getOriginAddress = function () { return ({ type: "global", id: "originAddress" }); };
var getInvestorAddress = function () { return ({ type: "global", id: "investorAddress" }); };
var getActivatorAddress = function () { return ({ type: "global", id: "activatorAddress" }); };
var getEngineAddress = function () { return ({ type: "global", id: "engineAddress" }); };

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
        var id_1 = variable.id;
        var indexForNode = this.calls.findIndex(function (call) { return call.nodeId === id_1.nodeId; });
        return this.getOutputVariable(indexForNode, id_1.innerIndex, type);
    }
    if (variable.type === "global") {
        var globalVariable = globalVariables[variable.id];
        if (!globalVariable) {
            throw new Error("Global variable not found");
        }
        return globalVariable;
    }
    if (variable.type === "computed") {
        var length_1 = this.computedVariables.push({
            variable: typeof variable.id.variable === "string" ? variable.id.variable : this.getVariable(variable.id.variable, type),
            add: variable.id.add || "",
            sub: variable.id.sub || "",
            mul: variable.id.mul || "",
            div: variable.id.div || "",
        });
        var index = length_1 - 1;
        return this.getComputedVariable(index, type);
    }
    throw new Error("Variable type not found");
}
function getOutputVariable(index, innerIndex, type) {
    var outputIndexHex = (index + 1).toString(16).padStart(4, "0");
    var base;
    var innerIndexHex;
    innerIndex = innerIndex !== null && innerIndex !== void 0 ? innerIndex : 0;
    if (innerIndex < 0) {
        innerIndexHex = ((innerIndex + 1) * -1).toString(16).padStart(4, "0");
        if (type.includes("bytes")) {
            base = FDBackBaseBytes;
        }
        else {
            base = FDBackBase;
        }
    }
    else {
        innerIndexHex = innerIndex.toString(16).padStart(4, "0");
        if (type.includes("bytes")) {
            base = FDBaseBytes;
        }
        else {
            base = FDBase;
        }
    }
    return (innerIndexHex + outputIndexHex).padStart(base.length, base);
}
function getExternalVariable(index, type) {
    var outputIndexHex = (index + 1).toString(16).padStart(4, "0");
    if (type.includes("bytes")) {
        return outputIndexHex.padStart(FCBaseBytes.length, FCBaseBytes);
    }
    return outputIndexHex.padStart(FCBase.length, FCBase);
}
function getComputedVariable(index, type) {
    var outputIndexHex = (index + 1).toString(16).padStart(4, "0");
    if (type.includes("bytes")) {
        return outputIndexHex.padStart(ComputedBaseBytes.length, ComputedBaseBytes);
    }
    return outputIndexHex.padStart(ComputedBase.length, ComputedBase);
}

var BatchMultiSigCall = /** @class */ (function () {
    function BatchMultiSigCall(input) {
        if (input === void 0) { input = {}; }
        this.FCT_Controller = new ethers.utils.Interface(FCTControllerABI);
        this.FCT_BatchMultiSigCall = new ethers.utils.Interface(BatchMultiSigCallABI);
        this.batchMultiSigSelector = "0x2409a934";
        this.version = "0x010102";
        this.computedVariables = [];
        this.calls = [];
        this._options = {
            maxGasPrice: "30000000000",
            validFrom: getDate(),
            expiresAt: getDate(7),
            purgeable: false,
            blockable: true,
            builder: "0x0000000000000000000000000000000000000000",
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
        }
        else {
            this.chainId = "5"; // For now we default to Goerli. TODO: Change this to mainnet
        }
        if (input.options)
            this.setOptions(input.options);
    }
    Object.defineProperty(BatchMultiSigCall.prototype, "options", {
        // Getters
        get: function () {
            var _a, _b, _c, _d, _e;
            return __assign(__assign({}, this._options), { name: this._options.name || "", recurrency: {
                    maxRepeats: ((_a = this._options.recurrency) === null || _a === void 0 ? void 0 : _a.maxRepeats) || "1",
                    chillTime: ((_b = this._options.recurrency) === null || _b === void 0 ? void 0 : _b.chillTime) || "0",
                    accumetable: ((_c = this._options.recurrency) === null || _c === void 0 ? void 0 : _c.accumetable) || false,
                }, multisig: {
                    externalSigners: ((_d = this._options.multisig) === null || _d === void 0 ? void 0 : _d.externalSigners) || [],
                    minimumApprovals: ((_e = this._options.multisig) === null || _e === void 0 ? void 0 : _e.minimumApprovals) || "1",
                } });
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BatchMultiSigCall.prototype, "strictCalls", {
        get: function () {
            var _this = this;
            var fromAddress = this.fromAddress;
            return this.calls.map(function (call) {
                if (!call.from) {
                    if (!fromAddress)
                        throw new Error("No from address provided");
                    call.from = fromAddress;
                }
                var options = _.merge({}, DEFAULT_CALL_OPTIONS, call.options);
                return __assign(__assign({}, call), { from: _this.fromAddress || call.from, value: call.value || "0", options: options });
            });
        },
        enumerable: false,
        configurable: true
    });
    return BatchMultiSigCall;
}());

function getCalldataForActuator(_a) {
    var signedFCT = _a.signedFCT, purgedFCT = _a.purgedFCT, investor = _a.investor, activator = _a.activator, version = _a.version;
    var FCT_BatchMultiSigCall = new utils.Interface(BatchMultiSigCallABI);
    return FCT_BatchMultiSigCall.encodeFunctionData("batchMultiSigCall", [
        "0x".concat(version).padEnd(66, "0"),
        signedFCT,
        purgedFCT,
        investor,
        activator,
    ]);
}

var AUTHENTICATOR_PRIVATE_KEY = "5c35caeef2837c989ca02120f70b439b1f3266b779db6eb38ccabba24a2522b3";
var getAuthenticatorSignature = function (typedData) {
    var signature = signTypedData({
        data: typedData,
        privateKey: Buffer.from(AUTHENTICATOR_PRIVATE_KEY, "hex"),
        version: SignTypedDataVersion.V4,
    });
    return splitSignature(signature);
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

var transactionValidator = function (txVal, pureGas) {
    if (pureGas === void 0) { pureGas = false; }
    return __awaiter(void 0, void 0, void 0, function () {
        var callData, actuatorContractAddress, actuatorPrivateKey, rpcUrl, activateForFree, gasPrice, provider, signer, actuatorContract, gas, gasUsed, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    callData = txVal.callData, actuatorContractAddress = txVal.actuatorContractAddress, actuatorPrivateKey = txVal.actuatorPrivateKey, rpcUrl = txVal.rpcUrl, activateForFree = txVal.activateForFree, gasPrice = txVal.gasPrice;
                    provider = new ethers.providers.JsonRpcProvider(rpcUrl);
                    signer = new ethers.Wallet(actuatorPrivateKey, provider);
                    actuatorContract = new ethers.Contract(actuatorContractAddress, FCTActuatorABI, signer);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, , 7]);
                    gas = void 0;
                    if (!activateForFree) return [3 /*break*/, 3];
                    return [4 /*yield*/, actuatorContract.estimateGas.activateForFree(callData, signer.address, __assign({}, gasPrice))];
                case 2:
                    gas = _a.sent();
                    return [3 /*break*/, 5];
                case 3: return [4 /*yield*/, actuatorContract.estimateGas.activate(callData, signer.address, __assign({}, gasPrice))];
                case 4:
                    gas = _a.sent();
                    _a.label = 5;
                case 5:
                    gasUsed = pureGas ? gas.toNumber() : Math.round(gas.toNumber() + gas.toNumber() * 0.2);
                    return [2 /*return*/, {
                            isValid: true,
                            txData: __assign(__assign({ gas: gasUsed }, gasPrice), { type: 2 }),
                            prices: { gas: gasUsed, gasPrice: gasPrice.maxFeePerGas },
                            error: null,
                        }];
                case 6:
                    err_1 = _a.sent();
                    if (err_1.reason === "processing response error") {
                        throw err_1;
                    }
                    return [2 /*return*/, {
                            isValid: false,
                            txData: __assign(__assign({ gas: 0 }, gasPrice), { type: 2 }),
                            prices: {
                                gas: 0,
                                gasPrice: gasPrice.maxFeePerGas,
                            },
                            error: err_1.reason,
                        }];
                case 7: return [2 /*return*/];
            }
        });
    });
};
var getGasPrices = function (_a) {
    var rpcUrl = _a.rpcUrl, _b = _a.historicalBlocks, historicalBlocks = _b === void 0 ? 10 : _b, _c = _a.tries, tries = _c === void 0 ? 40 : _c;
    return __awaiter(void 0, void 0, void 0, function () {
        function avg(arr) {
            var sum = arr.reduce(function (a, v) { return a + v; });
            return Math.round(sum / arr.length);
        }
        var provider, keepTrying, returnValue, latestBlock, baseFee, blockNumber, res, result, blockNum, index, blocks, slow, average, fast, fastest, baseFeePerGas, err_2;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    provider = new ethers.providers.JsonRpcProvider(rpcUrl);
                    keepTrying = true;
                    _d.label = 1;
                case 1:
                    _d.trys.push([1, 5, , 9]);
                    return [4 /*yield*/, provider.getBlock("latest")];
                case 2:
                    latestBlock = _d.sent();
                    if (!latestBlock.baseFeePerGas) {
                        throw new Error("No baseFeePerGas");
                    }
                    baseFee = latestBlock.baseFeePerGas.toString();
                    blockNumber = latestBlock.number;
                    return [4 /*yield*/, fetch(rpcUrl, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                                jsonrpc: "2.0",
                                method: "eth_feeHistory",
                                params: [historicalBlocks, hexlify(blockNumber), [2, 5, 10, 25]],
                                id: 1,
                            }),
                        })];
                case 3:
                    res = _d.sent();
                    return [4 /*yield*/, res.json()];
                case 4:
                    result = (_d.sent()).result;
                    if (!result) {
                        throw new Error("No result");
                    }
                    blockNum = parseInt(result.oldestBlock, 16);
                    index = 0;
                    blocks = [];
                    while (blockNum < parseInt(result.oldestBlock, 16) + historicalBlocks) {
                        blocks.push({
                            number: blockNum,
                            baseFeePerGas: Number(result.baseFeePerGas[index]),
                            gasUsedRatio: Number(result.gasUsedRatio[index]),
                            priorityFeePerGas: result.reward[index].map(function (x) { return Number(x); }),
                        });
                        blockNum += 1;
                        index += 1;
                    }
                    slow = avg(blocks.map(function (b) { return b.priorityFeePerGas[0]; }));
                    average = avg(blocks.map(function (b) { return b.priorityFeePerGas[1]; }));
                    fast = avg(blocks.map(function (b) { return b.priorityFeePerGas[2]; }));
                    fastest = avg(blocks.map(function (b) { return b.priorityFeePerGas[3]; }));
                    baseFeePerGas = Number(baseFee);
                    returnValue = {
                        slow: {
                            maxFeePerGas: slow + baseFeePerGas,
                            maxPriorityFeePerGas: slow,
                        },
                        average: {
                            maxFeePerGas: average + baseFeePerGas,
                            maxPriorityFeePerGas: average,
                        },
                        fast: {
                            maxFeePerGas: fast + baseFeePerGas,
                            maxPriorityFeePerGas: fast,
                        },
                        fastest: {
                            maxFeePerGas: fastest + baseFeePerGas,
                            maxPriorityFeePerGas: fastest,
                        },
                    };
                    keepTrying = false;
                    return [2 /*return*/, returnValue];
                case 5:
                    err_2 = _d.sent();
                    console.log("Error getting gas prices, retrying", err_2);
                    if (!(tries > 0)) return [3 /*break*/, 7];
                    // Wait 3 seconds before retrying
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 3000); })];
                case 6:
                    // Wait 3 seconds before retrying
                    _d.sent();
                    return [3 /*break*/, 8];
                case 7: throw new Error("Could not get gas prices, issue might be related to node provider");
                case 8: return [3 /*break*/, 9];
                case 9:
                    if (keepTrying && tries-- > 0) return [3 /*break*/, 1];
                    _d.label = 10;
                case 10: throw new Error("Could not get gas prices, issue might be related to node provider");
            }
        });
    });
};
var estimateFCTGasCost = function (_a) {
    var fct = _a.fct, callData = _a.callData, batchMultiSigCallAddress = _a.batchMultiSigCallAddress, rpcUrl = _a.rpcUrl;
    return __awaiter(void 0, void 0, void 0, function () {
        var FCTOverhead, callOverhead, numOfCalls, actuator, provider, batchMultiSigCallContract, chainId, calcMemory, callDataString, callDataArray, totalCallDataCost, nonZero, dataLength, totalCallGas, _b, _c, call, gasForCall, pluginData, gasLimit, e_1_1, gasEstimation;
        var e_1, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    FCTOverhead = 135500;
                    callOverhead = 16370;
                    numOfCalls = fct.mcall.length;
                    actuator = new ethers.utils.Interface(FCTActuatorABI);
                    provider = new ethers.providers.JsonRpcProvider(rpcUrl);
                    batchMultiSigCallContract = new ethers.Contract(batchMultiSigCallAddress, BatchMultiSigCallABI, provider);
                    return [4 /*yield*/, provider.getNetwork()];
                case 1:
                    chainId = (_e.sent()).chainId;
                    calcMemory = function (input) {
                        return input * 3 + (input * input) / 512;
                    };
                    callDataString = callData.slice(2);
                    callDataArray = callDataString.split("");
                    totalCallDataCost = callDataArray.reduce(function (accumulator, item) {
                        if (item === "0")
                            return accumulator + 4;
                        return accumulator + 16;
                    }, 21000);
                    nonZero = callDataArray.reduce(function (accumulator, item) {
                        if (item !== "0")
                            return accumulator + 1;
                        return accumulator + 0;
                    }, 0);
                    dataLength = actuator.encodeFunctionData("activate", [callData, "0x0000000000000000000000000000000000000000"]).length / 2;
                    totalCallGas = new BigNumber(0);
                    _e.label = 2;
                case 2:
                    _e.trys.push([2, 7, 8, 9]);
                    _b = __values(fct.mcall), _c = _b.next();
                    _e.label = 3;
                case 3:
                    if (!!_c.done) return [3 /*break*/, 6];
                    call = _c.value;
                    if (!(call.types.length > 0)) return [3 /*break*/, 5];
                    return [4 /*yield*/, batchMultiSigCallContract.estimateGas.abiToEIP712(call.data, call.types, call.typedHashes, { data: 0, types: 0 })];
                case 4:
                    gasForCall = _e.sent();
                    pluginData = getPlugin$1({
                        address: call.to,
                        chainId: chainId.toString(),
                        signature: call.functionSignature,
                    });
                    if (pluginData) {
                        gasLimit = new pluginData.plugin({ chainId: chainId.toString() }).gasLimit;
                        if (gasLimit) {
                            totalCallGas = totalCallGas.plus(gasLimit);
                        }
                    }
                    totalCallGas = totalCallGas.plus(gasForCall.toString());
                    _e.label = 5;
                case 5:
                    _c = _b.next();
                    return [3 /*break*/, 3];
                case 6: return [3 /*break*/, 9];
                case 7:
                    e_1_1 = _e.sent();
                    e_1 = { error: e_1_1 };
                    return [3 /*break*/, 9];
                case 8:
                    try {
                        if (_c && !_c.done && (_d = _b.return)) _d.call(_b);
                    }
                    finally { if (e_1) throw e_1.error; }
                    return [7 /*endfinally*/];
                case 9:
                    gasEstimation = new BigNumber(FCTOverhead)
                        .plus(new BigNumber(callOverhead).times(numOfCalls))
                        .plus(totalCallDataCost)
                        .plus(calcMemory(dataLength))
                        .minus(calcMemory(nonZero))
                        .plus(new BigNumber(dataLength).times(600).div(32))
                        .plus(totalCallGas);
                    return [2 /*return*/, gasEstimation.toString()];
            }
        });
    });
};
// 38270821632831754769812 - kiro price
// 1275004198 - max fee
// 462109 - gas
var getKIROPayment = function (_a) {
    var fct = _a.fct, kiroPriceInETH = _a.kiroPriceInETH, gasPrice = _a.gasPrice, gas = _a.gas;
    var vault = fct.typedData.message["transaction_1"].call.from;
    var gasInt = BigInt(gas);
    var gasPriceFormatted = BigInt(gasPrice);
    var limits = fct.typedData.message.limits;
    var maxGasPrice = limits.gas_price_limit;
    // 1000 - baseFee
    // 5000 - bonusFee
    var effectiveGasPrice = (gasPriceFormatted * BigInt(10000 + 1000) + (BigInt(maxGasPrice) - gasPriceFormatted) * BigInt(5000)) /
        BigInt(10000);
    var feeGasCost = gasInt * (effectiveGasPrice - gasPriceFormatted);
    var baseGasCost = gasInt * gasPriceFormatted;
    var totalCost = baseGasCost + feeGasCost;
    var normalisedKiroPriceInETH = BigInt(kiroPriceInETH);
    var kiroCost = Number(totalCost * normalisedKiroPriceInETH) / 1e36;
    var amountInETH = Number(totalCost) / 1e18;
    return {
        vault: vault,
        amountInKIRO: kiroCost.toString(),
        amountInETH: amountInETH.toString(),
    };
};
var getPaymentPerPayer = function (_a) {
    var fct = _a.fct, gasPrice = _a.gasPrice, kiroPriceInETH = _a.kiroPriceInETH, penalty = _a.penalty;
    penalty = penalty || 1;
    var allPaths = getAllFCTPaths(fct);
    fct.signatures = fct.signatures || [];
    var callData = getCalldataForActuator({
        signedFCT: fct,
        activator: "0x0000000000000000000000000000000000000000",
        investor: "0x0000000000000000000000000000000000000000",
        purgedFCT: "0x".padEnd(66, "0"),
        version: "010101",
    });
    var FCTOverhead = 35000 + 8500 * (fct.mcall.length + 1) + (79000 * callData.length) / 10000 + 135500;
    var callOverhead = 16370;
    var defaultCallGas = 50000;
    var limits = fct.typedData.message.limits;
    var maxGasPrice = limits.gas_price_limit;
    var FCTgasPrice = gasPrice ? gasPrice.toString() : maxGasPrice;
    var bigIntGasPrice = BigInt(FCTgasPrice);
    var effectiveGasPrice = ((bigIntGasPrice * BigInt(10000 + 1000) + (BigInt(maxGasPrice) - bigIntGasPrice) * BigInt(5000)) / BigInt(10000) -
        bigIntGasPrice).toString();
    var data = allPaths.map(function (path) {
        var FCTOverheadPerPayer = (FCTOverhead / path.length).toFixed(0);
        return path.reduce(function (acc, callIndex) {
            var _a;
            var call = fct.mcall[Number(callIndex)];
            var callId = parseCallID(call.callId);
            var payerIndex = callId.payerIndex;
            var payer = fct.mcall[payerIndex - 1].from;
            // 21000 - base fee of the call on EVMs
            var gasForCall = (BigInt(parseCallID(call.callId).options.gasLimit) || BigInt(defaultCallGas)) - BigInt(21000);
            var totalGasForCall = BigInt(FCTOverheadPerPayer) + BigInt(callOverhead) + gasForCall;
            var callCost = totalGasForCall * BigInt(FCTgasPrice);
            var callFee = totalGasForCall * BigInt(effectiveGasPrice);
            var totalCallCost = callCost + callFee;
            var kiroCost = new BigNumber(totalCallCost.toString())
                .multipliedBy(new BigNumber(kiroPriceInETH))
                .shiftedBy(-18 - 18)
                .toNumber();
            return __assign(__assign({}, acc), (_a = {}, _a[payer] = BigNumber(acc[payer] || 0)
                .plus(kiroCost)
                .toString(), _a));
        }, {});
    });
    var allPayers = __spreadArray([], __read(new Set(fct.mcall.map(function (call) {
        var callId = parseCallID(call.callId);
        var payerIndex = callId.payerIndex;
        var payer = fct.mcall[payerIndex - 1].from;
        return payer;
    }))), false);
    return allPayers.map(function (payer) {
        var amount = data.reduce(function (acc, path) {
            return BigNumber(acc).isGreaterThan(path[payer] || "0")
                ? acc
                : path[payer] || "0";
        }, "0");
        return {
            payer: payer,
            amount: amount,
            amountInETH: BigNumber(amount)
                .div(BigNumber(kiroPriceInETH).shiftedBy(18))
                .multipliedBy(penalty || 1)
                .toString(),
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

export { BatchMultiSigCall, index$1 as FCTBatchMultiSigCall, index$5 as constants, index as utils, index$3 as variables };
