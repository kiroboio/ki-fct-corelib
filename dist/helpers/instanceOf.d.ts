import { Param, Variable } from "../types";
export declare const instanceOfVariable: (object: any) => object is Variable;
export declare function instanceOfParams(objectOrArray: any): objectOrArray is Param | Param[];
export declare function valueNotUndefined<T>(value: T | undefined): value is T;
