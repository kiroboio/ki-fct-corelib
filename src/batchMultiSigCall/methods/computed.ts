import { IComputed, Variable } from "../../types";
import { BatchMultiSigCall } from "../batchMultiSigCall";

/**
 * Add a computed value to the batch call.
 *
 * @param computed - The computed value to add.
 * @returns The variable representing the computed value.
 */
export function addComputed(this: BatchMultiSigCall, computed: IComputed): Variable & { type: "computed" } {
  // Add the computed value to the batch call.
  const data = {
    id: computed.id || this._computed.length.toString(),
    value: computed.value,
    add: computed.add || "0",
    sub: computed.sub || "0",
    mul: computed.mul || "1",
    pow: computed.pow || "1",
    div: computed.div || "1",
    mod: computed.mod || "0",
  };
  this._computed.push(data);

  // Return the variable representing the computed value.
  return {
    type: "computed",
    id: data.id,
  };
}
