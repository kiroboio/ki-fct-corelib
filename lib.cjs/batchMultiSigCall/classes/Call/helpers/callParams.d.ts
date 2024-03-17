import { MethodParamsInterface, Param } from "../../../../types";
export declare const getMethodInterface: (call: {
    method?: string;
    params?: Param[];
}) => string;
export declare const getEncodedMethodParams: (call: Partial<MethodParamsInterface>) => string;
export declare const decodeFromData: (call: Partial<MethodParamsInterface>, data: string) => Array<any> | undefined;
export declare const decodeOutputData: (plugin: any | undefined, data: string) => Array<any> | null;
//# sourceMappingURL=callParams.d.ts.map