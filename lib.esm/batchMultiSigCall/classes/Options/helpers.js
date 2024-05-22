import { ethers } from "ethers";
import _ from "lodash";
const isAddress = ethers.utils.isAddress;
export const mustBeInteger = [
    "validFrom",
    "expiresAt",
    "maxGasPrice",
    "recurrency.maxRepeats",
    "recurrency.chillTime",
    "multisig.minimumApprovals",
];
export const mustBeAddress = ["builder.address"];
export const mustBeBoolean = ["purgeable", "blockable", "authEnabled", "dryRun", "recurrency.accumetable"];
export const mustBeObject = ["app", "builder", "recurrency", "multisig"];
export function validateOptionsValues({ value, initOptions, parentKeys = [], }) {
    Object.keys(value).forEach((key) => {
        const keyId = [...parentKeys, key].join(".");
        const objKey = key;
        // If value is undefined, skip it
        if (value[objKey] === undefined)
            return;
        OptionsValidator.validate({ keyId, key: objKey, parentKeys, value, initOptions });
    });
}
class OptionsValidator {
    keyId;
    key;
    parentKeys;
    value;
    initOptions;
    type;
    constructor({ keyId, key, parentKeys, value, initOptions, }) {
        this.keyId = keyId;
        this.key = key;
        this.parentKeys = parentKeys;
        this.value = value;
        this.initOptions = initOptions;
        if (mustBeObject.includes(keyId)) {
            this.type = "object";
        }
        else if (mustBeBoolean.includes(keyId)) {
            this.type = "boolean";
        }
        else if (mustBeInteger.includes(keyId)) {
            this.type = "integer";
        }
        else if (mustBeAddress.includes(keyId)) {
            this.type = "address";
        }
        else {
            this.type = "string";
        }
    }
    static validate = (data) => {
        return new OptionsValidator(data).validate();
    };
    validate() {
        switch (this.type) {
            case "object":
                return this._checkObject();
            case "boolean":
                return this._checkBoolean();
            case "integer":
                return this._checkInteger();
            case "address":
                return this._checkAddress();
            case "string":
                return this._checkString();
        }
    }
    _checkObject() {
        if (typeof this.value[this.key] === "object") {
            validateOptionsValues({
                value: this.value[this.key],
                initOptions: this.initOptions,
                parentKeys: [...this.parentKeys, this.key],
            });
            return;
        }
        else {
            throw new Error(`Options: ${this.keyId} must be an object`);
        }
    }
    _checkBoolean() {
        if (typeof this.value[this.key] !== "boolean") {
            throw new Error(`Options: ${this.keyId} must be a boolean`);
        }
        return;
    }
    _checkInteger() {
        const value = this._checkString();
        if (value.includes(".")) {
            throw new Error(`Options: ${this.keyId} cannot be a decimal`);
        }
        if (value.startsWith("-")) {
            throw new Error(`Options: ${this.keyId} cannot be negative`);
        }
        if (this.keyId === "recurrency.maxRepeats" && +value < 0) {
            throw new Error(`Options: ${this.keyId} should be at least 0. If value is 0 or 1, recurrency will not be enabled in order to save gas`);
        }
        if (this.key === "expiresAt") {
            const expiresAt = Number(value);
            const now = Number(new Date().getTime() / 1000).toFixed();
            const validFrom = this.value.validFrom;
            if (BigInt(expiresAt) <= BigInt(now)) {
                throw new Error(`Options: expiresAt must be in the future`);
            }
            if (validFrom && BigInt(expiresAt) <= BigInt(validFrom)) {
                throw new Error(`Options: expiresAt must be greater than validFrom`);
            }
        }
    }
    _checkAddress() {
        const value = this._checkString();
        if (!isAddress(value)) {
            throw new Error(`Options: ${this.keyId} is not a valid address`);
        }
    }
    _checkString() {
        const realVal = _.get(this.initOptions, this.keyId);
        const value = this.value[this.key];
        if (typeof value !== typeof realVal) {
            throw new Error(`Options: ${this.keyId} must be a ${typeof realVal}`);
        }
        return value;
    }
}
//# sourceMappingURL=helpers.js.map