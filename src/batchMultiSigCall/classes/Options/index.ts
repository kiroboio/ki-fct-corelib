import BigNumber from "bignumber.js";
import _ from "lodash";

import { getDate } from "../../../helpers";
import { DeepPartial, IFCTOptions, RequiredFCTOptions } from "../../../types";
import * as helpers from "./helpers";

const initOptions = {
  maxGasPrice: "30000000000", // 30 Gwei as default
  validFrom: getDate(), // Valid from now
  expiresAt: getDate(7), // Expires after 7 days
  purgeable: false,
  blockable: true,
  builder: "0x0000000000000000000000000000000000000000",
  authEnabled: true,
};

export class Options {
  static helpers = helpers;
  private _options: IFCTOptions = initOptions;

  public set(options: DeepPartial<IFCTOptions>) {
    const mergedOptions = _.merge({}, this._options, options);
    Options.verify(mergedOptions);
    this._options = mergedOptions;
    return this._options;
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
      const objKey = key as keyof typeof value;
      if (typeof value[objKey] === "object") {
        this.validateOptionsValues(value[objKey], [...parentKeys, objKey]);
      }
      // Integer validator
      if (helpers.mustBeInteger.includes(objKey)) {
        helpers.validateInteger(value[objKey] as string, [...parentKeys, objKey]);
      }
      // Address validator
      if (helpers.mustBeAddress.includes(objKey)) {
        helpers.validateAddress(value[objKey] as string, [...parentKeys, objKey]);
      }
      // Expires at validator
      if (objKey === "expiresAt") {
        const expiresAt = Number(value[objKey]);
        const now = Number(new Date().getTime() / 1000).toFixed();
        const validFrom = (value as IFCTOptions).validFrom;
        if (BigNumber(expiresAt).isLessThanOrEqualTo(now)) {
          throw new Error(`Options: expiresAt must be in the future`);
        }
        if (validFrom && BigNumber(expiresAt).isLessThanOrEqualTo(validFrom)) {
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
