"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPluginData = exports.getPluginClass = exports.getPlugin = void 0;
const ki_eth_fct_provider_ts_1 = require("@kirobo/ki-eth-fct-provider-ts");
const helpers_1 = require("../../helpers");
const helpers_2 = require("../helpers");
async function getPlugin(index) {
    const chainId = this.chainId;
    const call = this.getCall(index);
    if ((0, helpers_1.instanceOfVariable)(call.to)) {
        throw new Error("To value cannot be a variable");
    }
    const pluginData = (0, ki_eth_fct_provider_ts_1.getPlugin)({
        signature: (0, helpers_2.handleFunctionSignature)(call),
        address: call.to,
        chainId: chainId,
    });
    if (!pluginData) {
        throw new Error("Plugin not found");
    }
    const pluginClass = pluginData.plugin;
    const plugin = new pluginClass({
        chainId: chainId.toString(),
    });
    plugin.input.set({
        to: call.to,
        value: call.value,
        methodParams: call.params
            ? call.params.reduce((acc, param) => {
                return { ...acc, [param.name]: param.value };
            }, {})
            : {},
    });
    return plugin;
}
exports.getPlugin = getPlugin;
async function getPluginClass(index) {
    const chainId = this.chainId;
    const call = this.getCall(index);
    if ((0, helpers_1.instanceOfVariable)(call.to)) {
        throw new Error("To value cannot be a variable");
    }
    const pluginData = (0, ki_eth_fct_provider_ts_1.getPlugin)({
        signature: (0, helpers_2.handleFunctionSignature)(call),
        address: call.to,
        chainId: chainId.toString(),
    });
    return pluginData;
}
exports.getPluginClass = getPluginClass;
async function getPluginData(index) {
    const plugin = await this.getPlugin(index); // get the plugin from the index
    const call = this.getCall(index); // get the call from the index
    const input = {
        to: call.to,
        value: call.value,
        methodParams: call.params
            ? call.params.reduce((acc, param) => {
                return { ...acc, [param.name]: param.value };
            }, {})
            : {},
    };
    return {
        protocol: plugin.protocol,
        type: plugin.type,
        method: plugin.method,
        input,
    };
}
exports.getPluginData = getPluginData;
