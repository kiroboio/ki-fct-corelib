import { ethers } from "ethers";
import _ from "lodash";

import { getDate } from "../../../helpers";
import { DeepPartial, IFCTOptions, RequiredFCTOptions } from "../../../types";
import * as helpers from "./helpers";

const initOptions: IFCTOptions = {
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

  public set<O extends DeepPartial<IFCTOptions>>(options: O): IFCTOptions & O {
    const mergedOptions = _.merge({}, this._options, options);
    Options.verify(mergedOptions);
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
    parentKeys: string[] = []
  ) => {
    if (!value) {
      return;
    }
    Object.keys(value).forEach((key) => {
      const keyId = [...parentKeys, key].join(".");
      const objKey = key as keyof typeof value;
      if (helpers.mustBeObject.includes(keyId)) {
        if (typeof value[objKey] === "object") {
          this.validateOptionsValues(value[objKey], [...parentKeys, objKey]);
        } else {
          throw new Error(`Options: ${keyId} must be an object`);
        }
      }

      if (helpers.mustBeBoolean.includes(keyId)) {
        if (typeof value[objKey] !== "boolean") {
          throw new Error(`Options: ${keyId} must be a boolean`);
        }
      }

      // Else this must be a string. If it is not a string, throw an error
      if (typeof value[objKey] !== "string") {
        throw new Error(`Options: ${keyId} must be a string`);
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
    });
  };

  static fromObject(options: DeepPartial<IFCTOptions>) {
    const instance = new Options();
    instance.set(options);
    return instance;
  }
}
