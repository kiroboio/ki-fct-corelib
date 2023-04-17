import { Param } from "../../../types";
import { BatchMultiSigCallTypedData, FCTCallParam } from "../../types";
export declare const getParams: (params: Param[]) => Record<string, FCTCallParam>;
export declare const getUsedStructTypes: (typedData: BatchMultiSigCallTypedData, typeName: string) => string[];