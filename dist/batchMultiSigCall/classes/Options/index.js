"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Options = void 0;
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const lodash_1 = __importDefault(require("lodash"));
const helpers_1 = require("../../../helpers");
const helpers = __importStar(require("./helpers"));
const initOptions = {
    maxGasPrice: "30000000000",
    validFrom: (0, helpers_1.getDate)(),
    expiresAt: (0, helpers_1.getDate)(7),
    purgeable: false,
    blockable: true,
    builder: "0x0000000000000000000000000000000000000000",
    authEnabled: true,
};
class Options {
    constructor() {
        this._options = initOptions;
    }
    set(options) {
        const mergedOptions = lodash_1.default.merge({}, this._options, options);
        Options.verify(mergedOptions);
        this._options = mergedOptions;
        return this._options;
    }
    get() {
        return {
            ...this._options,
            name: this._options.name || "",
            recurrency: {
                maxRepeats: this._options.recurrency?.maxRepeats || "1",
                chillTime: this._options.recurrency?.chillTime || "0",
                accumetable: this._options.recurrency?.accumetable || false,
            },
            multisig: {
                externalSigners: this._options.multisig?.externalSigners || [],
                minimumApprovals: this._options.multisig?.minimumApprovals || "1",
            },
        };
    }
    reset() {
        this._options = initOptions;
    }
    static verify(options) {
        this.validateOptionsValues(options);
    }
    static fromObject(options) {
        const instance = new Options();
        instance.set(options);
        return instance;
    }
}
exports.Options = Options;
_a = Options;
Options.helpers = helpers;
Options.validateOptionsValues = (value, parentKeys = []) => {
    if (!value) {
        return;
    }
    Object.keys(value).forEach((key) => {
        const objKey = key;
        if (typeof value[objKey] === "object") {
            _a.validateOptionsValues(value[objKey], [...parentKeys, objKey]);
        }
        // Integer validator
        if (helpers.mustBeInteger.includes(objKey)) {
            helpers.validateInteger(value[objKey], [...parentKeys, objKey]);
        }
        // Address validator
        if (helpers.mustBeAddress.includes(objKey)) {
            helpers.validateAddress(value[objKey], [...parentKeys, objKey]);
        }
        // Expires at validator
        if (objKey === "expiresAt") {
            const expiresAt = Number(value[objKey]);
            const now = Number(new Date().getTime() / 1000).toFixed();
            const validFrom = value.validFrom;
            if ((0, bignumber_js_1.default)(expiresAt).isLessThanOrEqualTo(now)) {
                throw new Error(`Options: expiresAt must be in the future`);
            }
            if (validFrom && (0, bignumber_js_1.default)(expiresAt).isLessThanOrEqualTo(validFrom)) {
                throw new Error(`Options: expiresAt must be greater than validFrom`);
            }
        }
    });
};
