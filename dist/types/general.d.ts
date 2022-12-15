import { GlobalVariable } from "variables";
export type Variable = {
    type: "output";
    id: {
        nodeId: string;
        innerIndex: number;
    };
} | {
    type: "external";
    id: number;
} | {
    type: "global";
    id: GlobalVariable;
};
export interface Param {
    name: string;
    type: string;
    value?: boolean | string | string[] | Param[] | Param[][] | Variable;
    customType?: boolean;
}
export interface DecodeTx {
    encodedMessage: string;
    encodedDetails: string;
    params?: Param[];
}
