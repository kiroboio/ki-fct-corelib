import { ChainId, getPlugin as getPluginProvider, PluginInstance } from "@kirobo/ki-eth-fct-provider-ts";
import { BatchMultiSigCall } from "batchMultiSigCall/batchMultiSigCall";

import { instanceOfVariable } from "../../helpers";
import { handleFunctionSignature } from "../helpers";

export async function getPlugin(this: BatchMultiSigCall, index: number): Promise<PluginInstance> {
  let chainId: string;

  if (this.chainId) {
    chainId = this.chainId.toString();
  } else {
    const data = await this.provider.getNetwork();
    chainId = data.chainId.toString();
  }
  const call = this.getCall(index);

  if (instanceOfVariable(call.to)) {
    throw new Error("To value cannot be a variable");
  }

  const pluginData = getPluginProvider({
    signature: handleFunctionSignature(call),
    address: call.to,
    chainId: chainId as ChainId,
  });

  const pluginClass = pluginData.plugin as any;

  const plugin = new pluginClass({
    chainId: chainId.toString() as ChainId,
  }) as PluginInstance;

  plugin.input.set({
    to: call.to,
    methodParams: call.params.reduce((acc, param) => {
      return { ...acc, [param.name]: param.value };
    }, {}),
  });

  return plugin;
}

export async function getPluginClass(this: BatchMultiSigCall, index: number): Promise<any> {
  const { chainId } = await this.provider.getNetwork();
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
