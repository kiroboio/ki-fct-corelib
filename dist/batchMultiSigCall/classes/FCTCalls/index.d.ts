import { DecodedCalls, DeepPartial, FCTCall, ICallDefaults, IMSCallInputWithNodeId, IMSCallWithEncodedData, IWithPlugin, StrictMSCallInput } from "types";
import { BatchMultiSigCall } from "../../batchMultiSigCall";
import * as helpers from "./helpers";
export declare class FCTCalls {
    static helpers: typeof helpers;
    FCT: BatchMultiSigCall;
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
}
