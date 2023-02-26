import { IComputed, Variable } from "../../types";
import { BatchMultiSigCall } from "../batchMultiSigCall";

export function addComputed(this: BatchMultiSigCall, computed: IComputed): Variable & { type: "computed" } {
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
  return {
    type: "computed",
    id: data.id,
  };
}
