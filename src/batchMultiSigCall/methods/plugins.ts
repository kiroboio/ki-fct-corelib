import { ChainId, getPlugin as getPluginProvider, Multicall, PluginInstance } from "@kiroboio/fct-plugins";

import { InstanceOf } from "../../helpers";
import { BatchMultiSigCall } from "../batchMultiSigCall";

export async function getPlugin(this: BatchMultiSigCall, index: number): Promise<PluginInstance> {
  const chainId = this.chainId;
  const call = this.getCall(index);

  const callData = call.get();

  if (InstanceOf.Variable(callData.to)) {
    throw new Error("To value cannot be a variable");
  }

  let PluginClass: PluginInstance;

  // if (callData.toENS === "@lib:multicall") {
  //   const plugin = getMulticallPlugin({
  //     signature: call.getFunctionSignature(),
  //     chainId: chainId as ChainId,
  //   });
  //   if (!plugin) {
  //     throw new Error("Multicall plugin not found");
  //   }
  //   PluginClass = plugin as unknown as PluginInstance;
  // } else {
  const pluginData = getPluginProvider({
    signature: call.getFunctionSignature(),
    address: callData.to,
    chainId: chainId as ChainId,
  });
  if (pluginData === null || pluginData === undefined) {
    throw new Error("Plugin not found");
  }
  if (pluginData instanceof Multicall) {
    PluginClass = pluginData as unknown as PluginInstance;
  } else {
    PluginClass = new pluginData.plugin({
      chainId: chainId.toString() as ChainId,
    }) as unknown as PluginInstance;
  }
  // }

  PluginClass.input.set({
    to: callData.to,
    value: callData.value as any, // TODO: Temporary fix, need to fix the type in plugins
    methodParams: callData.params
      ? callData.params.reduce((acc, param) => {
          return { ...acc, [param.name]: param.value };
        }, {})
      : {},
  });

  return PluginClass;
}

export async function getPluginClass(
  this: BatchMultiSigCall,
  index: number,
): Promise<ReturnType<typeof getPluginProvider>> {
  const chainId = this.chainId;
  const call = this.getCall(index);
  const callData = call.get();

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
