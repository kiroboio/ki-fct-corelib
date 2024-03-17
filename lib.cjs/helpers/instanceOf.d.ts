import { ValidationVariable } from "../batchMultiSigCall/classes/Validation/types";
import { IWithPlugin, Param, Variable } from "../types";
export declare class InstanceOf {
    static Variable: (object: any) => object is Variable;
    static TupleArray: (value: Param["value"], param: Param) => value is Param[][];
    static Tuple: (value: Param["value"], param: Param) => value is Param[];
    static CallWithPlugin: (object: any) => object is IWithPlugin;
    static ValidationVariable: (object: any) => object is ValidationVariable;
    static Param: (data: any) => data is Param[];
    static ParamArray: (data: any) => data is Param[][];
    static ComputedVariable: (object: any) => object is {
        type: "computed";
        id: string;
    };
}
//# sourceMappingURL=instanceOf.d.ts.map