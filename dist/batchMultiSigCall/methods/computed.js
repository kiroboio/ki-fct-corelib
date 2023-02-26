"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addComputed = void 0;
function addComputed(computed) {
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
exports.addComputed = addComputed;
