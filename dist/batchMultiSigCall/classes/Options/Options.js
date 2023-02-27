"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Options = void 0;
const lodash_1 = __importDefault(require("lodash"));
const helpers_1 = require("../../../helpers");
const helpers_2 = require("./helpers");
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
        (0, helpers_2.verifyOptions)(options);
    }
    static fromObject(options) {
        const instance = new Options();
        instance.set(options);
        return instance;
    }
}
exports.Options = Options;
