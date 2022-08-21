import { Flow } from "../constants";
import { MultiCallBase, Validator } from "../interfaces";
export interface MSCallInput extends Omit<MultiCallBase, "flags"> {
    value: string;
    to: string;
    from: string;
    toEnsHash?: string;
    validator?: Validator;
    flow?: Flow;
    jump?: number;
    viewOnly?: boolean;
}
export interface MSCall {
    typeHash: string;
    ensHash: string;
    functionSignature: string;
    value: string;
    from: string;
    gasLimit: number;
    flags: string;
    to: string;
    data: string;
    types: number[];
    typedHashes: string[];
}
