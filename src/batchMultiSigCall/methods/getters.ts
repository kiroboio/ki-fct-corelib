import _ from "lodash";

import { instanceOfVariable } from "../../helpers";
import { ParamWithoutVariable } from "../../types";
import { BatchMultiSigCall } from "../batchMultiSigCall";
import { ComputedVariables, DecodedCalls, StrictMSCallInput } from "../types";

export function _getComputedVariables(this: BatchMultiSigCall): ComputedVariables[] {
  return this.calls.reduce((acc, call) => {
    if (call.params) {
      call.params.forEach((param) => {
        if (instanceOfVariable(param.value) && param.value.type === "computed") {
          const variable = param.value;
          acc.push({
            variable:
              typeof variable.id.variable === "string"
                ? variable.id.variable
                : this.getVariable(variable.id.variable, param.type),
            add: variable.id.add || "",
            sub: variable.id.sub || "",
            mul: variable.id.mul || "",
            div: variable.id.div || "",
          });
        }
      });
    }
    return acc;
  }, [] as ComputedVariables[]);
}

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
