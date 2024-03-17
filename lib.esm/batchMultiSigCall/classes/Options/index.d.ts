import { DeepPartial, IFCTOptions, RequiredFCTOptions } from "../../../types";
import * as helpers from "./helpers";
export declare class Options {
    static helpers: typeof helpers;
    private _options;
    set<O extends DeepPartial<IFCTOptions>>(options: O, verify?: boolean): IFCTOptions & O;
    get(): RequiredFCTOptions;
    reset(): void;
    static verify(options: IFCTOptions): void;
    static validateOptionsValues: (value: Partial<IFCTOptions> | IFCTOptions["recurrency"] | IFCTOptions["multisig"], parentKeys?: string[]) => void;
    static fromObject(options: DeepPartial<IFCTOptions>): Options;
}
//# sourceMappingURL=index.d.ts.map