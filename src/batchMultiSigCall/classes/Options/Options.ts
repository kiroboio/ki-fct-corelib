import { verifyOptions } from "batchMultiSigCall/helpers";
import { getDate } from "helpers";
import _ from "lodash";
import { DeepPartial, IFCTOptions, RequiredFCTOptions } from "types";

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

  public reset() {
    this._options = initOptions;
  }

  static verify(options: IFCTOptions) {
    verifyOptions(options);
  }

  static fromObject(options: DeepPartial<IFCTOptions>) {
    const instance = new Options();
    instance.set(options);
    return instance;
  }
}
