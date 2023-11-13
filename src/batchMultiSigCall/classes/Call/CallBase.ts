import { utils } from "ethers";

import { nullValue } from "../../../constants";
import { deepMerge } from "../../../helpers/deepMerge";
import { CallOptions, DeepPartial, Variable } from "../../../types";
import { IMSCallInput } from "../../types";
import { generateNodeId, getTypesArray } from "./helpers";
import { getMethodInterface } from "./helpers/callParams";

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

  get nodeId(): string {
    return this._call.nodeId;
  }

  public getOutputVariable(innerIndex = 0): Variable & { type: "output" } {
    return {
      type: "output",
      id: {
        nodeId: this._call.nodeId,
        innerIndex,
      },
    };
  }

  public getTypesArray() {
    const call = this._call;
    if (!call.params) {
      return [];
    }

    return getTypesArray(call.params);
  }

  public getFunctionSignature(): string {
    if (this._call.method) {
      return utils.id(this.getFunction());
    }
    return nullValue;
  }

  public getFunction(): string {
    return getMethodInterface({
      method: this._call.method,
      params: this._call.params,
    });
  }

  public setOptions(options: DeepPartial<CallOptions>) {
    this._call.options = deepMerge(this._call.options, options);
  }

  public update(call: DeepPartial<IMSCallInput>) {
    this._call = deepMerge(this._call, call);
  }
}
