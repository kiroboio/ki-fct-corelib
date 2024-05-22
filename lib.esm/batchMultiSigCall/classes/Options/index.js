import { ethers } from "ethers";
import { getDate } from "../../../helpers";
import { deepMerge } from "../../../helpers/deepMerge";
import * as helpers from "./helpers";
const initOptions = {
    id: "",
    name: "",
    maxGasPrice: "30000000000", // 30 Gwei as default
    payableGasLimitInKilo: "0",
    validFrom: getDate(), // Valid from now
    expiresAt: getDate(7), // Expires after 7 days
    purgeable: false,
    blockable: true,
    authEnabled: true,
    dryRun: false,
    verifier: "",
    domain: "",
    builder: {
        name: "",
        address: ethers.constants.AddressZero,
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
export class Options {
    static helpers = helpers;
    _options = initOptions;
    set(options, verify = true) {
        const mergedOptions = deepMerge(this._options, options);
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
//# sourceMappingURL=index.js.map