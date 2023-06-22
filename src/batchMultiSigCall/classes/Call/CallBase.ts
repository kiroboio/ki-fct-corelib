import { utils } from "ethers";
import _ from "lodash";

import { nullValue } from "../../../constants";
import { InstanceOf } from "../../../helpers";
import { CallOptions, DeepPartial, Param } from "../../../types";
import { IMSCallInput } from "../../types";
import { generateNodeId, getTypesArray } from "./helpers";

export class CallBase {
  protected _call: IMSCallInput & { nodeId: string };
  constructor(input: IMSCallInput) {
    let fullInput: IMSCallInput & { nodeId: string };
    if (!input.nodeId) {
      fullInput = { ...input, nodeId: generateNodeId() };
    } else {
      fullInput = input as IMSCallInput & { nodeId: string };
    }

    this._call = fullInput;
  }

  get call(): IMSCallInput & { nodeId: string } {
    return this._call;
  }

  public setOptions(options: DeepPartial<CallOptions>) {
    this._call.options = _.merge({}, this._call.options, options);
  }

  public getTypesArray() {
    const call = this._call;
    if (!call.params) {
      return [];
    }

    return getTypesArray(call.params);
  }

  public getFunctionSignature(): string {
    const call = this._call;
    if (call.method) {
      return utils.id(this.getFunction());
    }
    return nullValue;
  }

  public getFunction(): string {
    const call = this._call;

    const getParamsType = (param: Param): string => {
      if (InstanceOf.Tuple(param.value, param)) {
        const value = param.value as Param[];
        return `(${value.map(getParamsType).join(",")})`;
      } else if (InstanceOf.TupleArray(param.value, param)) {
        const value = param.value[0] as Param[];
        return `(${value.map(getParamsType).join(",")})[]`;
      }

      return param.hashed ? "bytes32" : param.type;
    };
    const params = call.params ? call.params.map(getParamsType) : "";

    return `${call.method}(${params})`;
  }
}
