"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPluginData = void 0;
async function getPluginData(index) {
    const plugin = await this.getPlugin(index);
    const call = this.getCall(index);
    return {
        protocol: plugin.protocol,
        type: plugin.type,
        method: plugin.method,
        input: {
            to: call.to,
            value: call.value,
            methodParams: call.params.reduce((acc, param) => {
                return { ...acc, [param.name]: param.value };
            }, {}),
        },
    };
}
exports.getPluginData = getPluginData;
