import { ethers } from "ethers";

import { getDate } from "../../../helpers";
import { deepMerge } from "../../../helpers/deepMerge";
import { DeepPartial, IFCTOptions, RequiredFCTOptions } from "../../../types";
import * as helpers from "./helpers";

const initOptions: IFCTOptions = {
  id: "",
  name: "",
  maxGasPrice: "30000000000", // 30 Gwei as default
  payableGasLimit: "0",
  validFrom: getDate(), // Valid from now
  expiresAt: getDate(7), // Expires after 7 days
  purgeable: false,
  blockable: true,
  authEnabled: true,
  dryRun: false,
  forceDryRun: false,
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
    helpers.validateOptionsValues({
      value,
      initOptions: initOptions,
      parentKeys,
    });
  };

  static fromObject(options: DeepPartial<IFCTOptions>) {
    const instance = new Options();
    instance.set(options);
    return instance;
  }
}
