import { MethodParamsInterface } from "../types";
export declare const getMethodInterface: (call: Partial<MethodParamsInterface>) => string;
export declare const getEncodedMethodParams: (call: Partial<MethodParamsInterface>, withFunction?: boolean) => string;
export declare const getParamsLength: (encodedParams: string) => string;
