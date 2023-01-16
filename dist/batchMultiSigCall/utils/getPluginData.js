"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPluginData = void 0;
async function getPluginData(index) {
    const plugin = await this.getPlugin(index);
    return {
        plugin,
        protocol: plugin.protocol,
        type: plugin.type,
        method: plugin.method,
        input: plugin.input.get(),
    };
}
exports.getPluginData = getPluginData;
