import { getPlugin as getPluginProvider, Multicall } from "@kiroboio/fct-plugins";
import { InstanceOf } from "../../helpers";
export async function getPlugin(index) {
    const chainId = this.chainId;
    const call = this.getCall(index);
    const callData = call.get();
    if (InstanceOf.Variable(callData.to)) {
        throw new Error("To value cannot be a variable");
    }
    let PluginClass;
    const pluginData = getPluginProvider({
        signature: call.getFunctionSignature(),
        address: callData.to,
        chainId: chainId,
    });
    if (pluginData === null || pluginData === undefined) {
        throw new Error("Plugin not found");
    }
    if (pluginData instanceof Multicall) {
        PluginClass = pluginData;
    }
    else {
        PluginClass = new pluginData.plugin({
            chainId: chainId.toString(),
        });
    }
    PluginClass.input.set({
        to: callData.to,
        value: callData.value, // TODO: Temporary fix, need to fix the type in plugins
        methodParams: callData.params
            ? callData.params.reduce((acc, param) => {
                return { ...acc, [param.name]: param.value };
            }, {})
            : {},
    });
    return PluginClass;
}
export async function getPluginClass(index) {
    const chainId = this.chainId;
    const call = this.getCall(index);
    const callData = call.get();
    if (InstanceOf.Variable(callData.to)) {
        throw new Error("To value cannot be a variable");
    }
    const pluginData = getPluginProvider({
        signature: call.getFunctionSignature(),
        address: callData.to,
        chainId: chainId.toString(),
    });
    return pluginData;
}
export async function getPluginData(index) {
    const plugin = await this.getPlugin(index); // get the plugin from the index
    const call = this.getCall(index); // get the call from the index
    const callData = call.get();
    const input = {
        to: callData.to,
        value: callData.value,
        methodParams: callData.params
            ? callData.params.reduce((acc, param) => {
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
//# sourceMappingURL=plugins.js.map