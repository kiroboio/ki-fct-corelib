import { IFCTOptions } from "../../types";
export declare const mustBeInteger: string[];
export declare const mustBeAddress: string[];
export declare const mustBeBoolean: string[];
export declare const mustBeObject: string[];
export declare function validateOptionsValues({ value, initOptions, parentKeys, }: {
    value: Partial<IFCTOptions> | IFCTOptions["recurrency"] | IFCTOptions["multisig"];
    initOptions: IFCTOptions;
    parentKeys: string[];
}): void;
//# sourceMappingURL=helpers.d.ts.map