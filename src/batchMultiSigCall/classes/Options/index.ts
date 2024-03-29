import { ethers } from "ethers";
import _ from "lodash";

import { getDate } from "../../../helpers";
import { deepMerge } from "../../../helpers/deepMerge";
import { DeepPartial, IFCTOptions, RequiredFCTOptions } from "../../../types";
import * as helpers from "./helpers";

const initOptions: IFCTOptions = {
  id: "",
  name: "",
  maxGasPrice: "30000000000", // 30 Gwei as default
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
  private _options: IFCTOptions = initOptions;

  public set<O extends DeepPartial<IFCTOptions>>(options: O, verify = true): IFCTOptions & O {
    const mergedOptions = deepMerge(this._options, options);
    if (verify) Options.verify(mergedOptions);
    this._options = mergedOptions;
    return this._options as IFCTOptions & O;
  }

  public get(): RequiredFCTOptions {
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

  public reset() {
    this._options = initOptions;
  }

  static verify(options: IFCTOptions) {
    this.validateOptionsValues(options);
  }

  static validateOptionsValues = (
    value: Partial<IFCTOptions> | IFCTOptions["recurrency"] | IFCTOptions["multisig"],
    parentKeys: string[] = [],
  ) => {
    if (!value) {
      return;
    }
    Object.keys(value).forEach((key) => {
      const keyId = [...parentKeys, key].join(".");
      const objKey = key as keyof typeof value;
      // If value is undefined, skip it
      if (value[objKey] === undefined) {
        return;
      }

      if (helpers.mustBeObject.includes(keyId)) {
        if (typeof value[objKey] === "object") {
          this.validateOptionsValues(value[objKey], [...parentKeys, objKey]);
          return;
        } else {
          throw new Error(`Options: ${keyId} must be an object`);
        }
      }

      if (helpers.mustBeBoolean.includes(keyId)) {
        if (typeof value[objKey] !== "boolean") {
          throw new Error(`Options: ${keyId} must be a boolean`);
        }
        return;
      }

      // Else this must be a string. If it is not a string, throw an error
      // Get value from keyId
      const realVal = _.get(initOptions, keyId);
      if (typeof value[objKey] !== typeof realVal) {
        throw new Error(`Options: ${keyId} must be a ${typeof realVal}`);
      }

      // Integer validator
      if (helpers.mustBeInteger.includes(keyId)) {
        helpers.validateInteger(value[objKey] as string, keyId);
      }
      // Address validator
      if (helpers.mustBeAddress.includes(keyId)) {
        helpers.validateAddress(value[objKey] as string, keyId);
      }
      // Expires at validator
      if (objKey === "expiresAt") {
        const expiresAt = Number(value[objKey]);
        const now = Number(new Date().getTime() / 1000).toFixed();
        const validFrom = (value as IFCTOptions).validFrom;

        if (BigInt(expiresAt) <= BigInt(now)) {
          throw new Error(`Options: expiresAt must be in the future`);
        }
        if (validFrom && BigInt(expiresAt) <= BigInt(validFrom)) {
          throw new Error(`Options: expiresAt must be greater than validFrom`);
        }
      }
      // TODO: Should think how to validate maxGasPrice, because this will not work with notificaiton FCTs
      // if (objKey === "maxGasPrice") {
      //   // Max gas price cannot be 0
      //   if (BigInt(value[objKey]) <= BigInt(0)) {
      //     throw new Error(`Options: maxGasPrice must be greater than 0`);
      //   }
      // }
    });
  };

  static fromObject(options: DeepPartial<IFCTOptions>) {
    const instance = new Options();
    instance.set(options);
    return instance;
  }
}
