import { utils } from "ethers";

import { EMPTY_HASH } from "../../../constants";
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

  public getOutputVariable(offset = 0): Variable & { type: "output" } {
    return {
      type: "output",
      id: {
        nodeId: this._call.nodeId,
        offset,
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

  /**
   * Returns the function signature of the call.
   * If the call has a method, it returns the function signature using the `utils.id` function.
   * Otherwise, it returns hashed empty string. (ethers.utils.id(''))
   *
   * @returns The function signature of the call or hashed empty string.
   */
  public getFunctionSignature(): string {
    return this._call.method ? utils.id(this.getFunction()) : EMPTY_HASH;
  }

  public getFunction(): string {
    return this._call.options?.usePureMethod
      ? this._call.method || ""
      : getMethodInterface({
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
