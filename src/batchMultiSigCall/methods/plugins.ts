import { ChainId, getPlugin as getPluginProvider, PluginInstance } from "@kiroboio/fct-plugins";

import { InstanceOf } from "../../helpers";
import { BatchMultiSigCall } from "../batchMultiSigCall";

export async function getPlugin(this: BatchMultiSigCall, index: number): Promise<PluginInstance> {
  const chainId = this.chainId;
  const call = this.getCall(index);

  const callData = call.data;

  if (InstanceOf.Variable(callData.to)) {
    throw new Error("To value cannot be a variable");
  }

  const pluginData = getPluginProvider({
    signature: call.getFunctionSignature(),
    address: callData.to,
    chainId: chainId as ChainId,
  });

  if (!pluginData) {
    throw new Error("Plugin not found");
  }

  const pluginClass = pluginData.plugin as any;

  const plugin = new pluginClass({
    chainId: chainId.toString() as ChainId,
  }) as PluginInstance;

  plugin.input.set({
    to: callData.to,
    value: callData.value as any, // TODO: Temporary fix, need to fix the type in plugins
    methodParams: callData.params
      ? callData.params.reduce((acc, param) => {
          return { ...acc, [param.name]: param.value };
        }, {})
      : {},
  });

  return plugin;
}

export async function getPluginClass(
  this: BatchMultiSigCall,
  index: number
): Promise<ReturnType<typeof getPluginProvider>> {
  const chainId = this.chainId;
  const call = this.getCall(index);
  const callData = call.data;

  if (InstanceOf.Variable(callData.to)) {
    throw new Error("To value cannot be a variable");
  }

  const pluginData = getPluginProvider({
    signature: call.getFunctionSignature(),
    address: callData.to,
    chainId: chainId.toString() as ChainId,
  });

  return pluginData;
}

export async function getPluginData(this: BatchMultiSigCall, index: number) {
  const plugin = await this.getPlugin(index); // get the plugin from the index
  const call = this.getCall(index); // get the call from the index
  const callData = call.data;

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
