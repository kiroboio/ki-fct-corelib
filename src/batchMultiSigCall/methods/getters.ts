import _ from "lodash";

import { ParamWithoutVariable } from "../../types";
import { BatchMultiSigCall } from "../batchMultiSigCall";
import { DecodedCalls, StrictMSCallInput } from "../types";

export function _getDecodedCalls(this: BatchMultiSigCall): DecodedCalls[] {
  return this.calls.map((call) => {
    const params = call.params;
    if (params && params.length > 0) {
      const parameters = this.decodeParams(params);
      return { ...call, params: parameters };
    }
    return {
      ...call,
      params: [] as ParamWithoutVariable[],
    };
  });
}

export function _getCalls(this: BatchMultiSigCall): StrictMSCallInput[] {
  return this._calls.map((call): StrictMSCallInput => {
    const fullCall = _.merge({}, this._callDefault, call);

    if (typeof fullCall.from === "undefined") {
      throw new Error("From address is required");
    }

    const from = fullCall.from;

    return { ...fullCall, from };
  });
}
