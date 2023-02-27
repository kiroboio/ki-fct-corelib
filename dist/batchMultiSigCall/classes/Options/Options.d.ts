import { DeepPartial, IFCTOptions, RequiredFCTOptions } from "types";
export declare class Options {
    private _options;
    set(options: DeepPartial<IFCTOptions>): IFCTOptions;
    get(): RequiredFCTOptions;
    reset(): void;
    static verify(options: IFCTOptions): void;
    static fromObject(options: DeepPartial<IFCTOptions>): Options;
}
