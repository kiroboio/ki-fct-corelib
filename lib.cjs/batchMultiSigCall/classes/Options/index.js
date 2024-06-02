"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Options = void 0;
const tslib_1 = require("tslib");
const ethers_1 = require("ethers");
const helpers_1 = require("../../../helpers");
const deepMerge_1 = require("../../../helpers/deepMerge");
const helpers = tslib_1.__importStar(require("./helpers"));
const initOptions = {
    id: "",
    name: "",
    maxGasPrice: "30000000000", // 30 Gwei as default
    payableGasLimitInKilo: "0",
    validFrom: (0, helpers_1.getDate)(), // Valid from now
    expiresAt: (0, helpers_1.getDate)(7), // Expires after 7 days
    purgeable: false,
    blockable: true,
    authEnabled: true,
    dryRun: false,
    verifier: "",
    domain: "",
    builder: {
        name: "",
        address: ethers_1.ethers.constants.AddressZero,
    },
    app: {
        name: "",
        version: "",
    },
    recurrency: {
        maxRepeats: "0",
        chillTime: "0",
        accumetable: false,
    },
    multisig: {
        externalSigners: [],
        minimumApprovals: "0",
    },
};
class Options {
    static helpers = helpers;
    _options = initOptions;
    set(options, verify = true) {
        const mergedOptions = (0, deepMerge_1.deepMerge)(this._options, options);
        if (verify)
            Options.verify(mergedOptions);
        this._options = mergedOptions;
        return this._options;
    }
    get() {
        return {
            ...this._options,
            name: this._options.name || "",
            recurrency: {
                maxRepeats: this._options.recurrency?.maxRepeats || "0",
                chillTime: this._options.recurrency?.chillTime || "0",
                accumetable: this._options.recurrency?.accumetable || false,
            },
            multisig: {
                externalSigners: this._options.multisig?.externalSigners || [],
                minimumApprovals: this._options.multisig?.minimumApprovals || "0",
            },
        };
    }
    reset() {
        this._options = initOptions;
    }
    static verify(options) {
        this.validateOptionsValues(options);
    }
    static validateOptionsValues = (value, parentKeys = []) => {
        if (!value) {
            return;
        }
        helpers.validateOptionsValues({
            value,
            initOptions: initOptions,
            parentKeys,
        });
    };
    static fromObject(options) {
        const instance = new Options();
        instance.set(options);
        return instance;
    }
}
exports.Options = Options;
//# sourceMappingURL=index.js.map