import { Param, Variable } from "../interfaces";
export declare const instanceOfVariable: (object: any) => object is Variable;
export declare function instanceOfParams(objectOrArray: any): objectOrArray is Param | Param[];
