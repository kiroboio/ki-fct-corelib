import { ethers } from "ethers";
import { FCTCallParam, Param, ParamValue, TypedDataTypes, Variable } from "../../../../types";
export declare const variableStarts: string[];
export declare const manageValue: (value: string | number | boolean | Variable) => string | boolean | Variable;
export declare const getParams: (params: Param[]) => Record<string, FCTCallParam>;
export declare const getParamsFromInputs: (inputs: ethers.utils.ParamType[], values: ethers.utils.Result) => Param[];
export declare const getParamsFromTypedData: ({ coreParamTypes, parameters, types, primaryType, }: {
    coreParamTypes: ethers.utils.ParamType[];
    parameters: Record<string, FCTCallParam>;
    types: TypedDataTypes;
    primaryType: string;
}) => Param[];
export declare const getAllSimpleParams: (params: Param[]) => ParamValue[];
//# sourceMappingURL=params.d.ts.map