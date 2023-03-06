import { DeepPartial, Param, ParamWithoutVariable } from "../../../types";
import { BatchMultiSigCall } from "../../batchMultiSigCall";
import { DecodedCalls, FCTCall, ICallDefaults, IMSCallInputWithNodeId, IMSCallWithEncodedData, IWithPlugin, StrictMSCallInput } from "../../types";
import { FCTBase } from "../FCTBase";
import * as helpers from "./helpers";
export declare class FCTCalls extends FCTBase {
    static helpers: typeof helpers;
    private _calls;
    private _callDefault;
    constructor(FCT: BatchMultiSigCall, callDefault?: DeepPartial<ICallDefaults>);
    get(): StrictMSCallInput[];
    getWithDecodedVariables(): DecodedCalls[];
    create(call: FCTCall): Promise<IMSCallInputWithNodeId>;
    createWithPlugin(callWithPlugin: IWithPlugin): Promise<IMSCallInputWithNodeId>;
    createWithEncodedData(callWithEncodedData: IMSCallWithEncodedData): Promise<IMSCallInputWithNodeId>;
    setCallDefaults(callDefault: DeepPartial<ICallDefaults>): ICallDefaults;
    private addCall;
    private verifyCall;
    decodeParams(params: Param[]): ParamWithoutVariable[];
}
