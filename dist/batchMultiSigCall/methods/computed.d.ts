import { IComputed, Variable } from "../../types";
import { BatchMultiSigCall } from "../batchMultiSigCall";
export declare function addComputed(this: BatchMultiSigCall, computed: IComputed): Variable & {
    type: "computed";
};
