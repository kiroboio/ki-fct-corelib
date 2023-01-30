import { ChainId, getPlugin as getPluginProvider, PluginInstance } from "@kirobo/ki-eth-fct-provider-ts";

import { instanceOfVariable } from "../../helpers";
import { BatchMultiSigCall } from "../batchMultiSigCall";
import { handleFunctionSignature } from "../helpers";

export async function getPlugin(this: BatchMultiSigCall, index: number): Promise<PluginInstance> {
  const chainId = this.chainId;

  const call = this.getCall(index);

  if (instanceOfVariable(call.to)) {
    throw new Error("To value cannot be a variable");
  }

  const pluginData = getPluginProvider({
    signature: handleFunctionSignature(call),
    address: call.to,
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

export async function getPluginClass(
  this: BatchMultiSigCall,
  index: number
): Promise<ReturnType<typeof getPluginProvider>> {
  const chainId = this.chainId;
  const call = this.getCall(index);

  if (instanceOfVariable(call.to)) {
    throw new Error("To value cannot be a variable");
  }

  const pluginData = getPluginProvider({
    signature: handleFunctionSignature(call),
    address: call.to,
    chainId: chainId.toString() as ChainId,
  });

  return pluginData;
}
