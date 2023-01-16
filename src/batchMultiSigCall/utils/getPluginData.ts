import { BatchMultiSigCall } from "../batchMultiSigCall";

export async function getPluginData(this: BatchMultiSigCall, index?: number) {
  const plugin = await this.getPlugin(index);

  return {
    plugin,
    protocol: plugin.protocol,
    type: plugin.type,
    method: plugin.method,
    input: plugin.input.get(),
  };
}
