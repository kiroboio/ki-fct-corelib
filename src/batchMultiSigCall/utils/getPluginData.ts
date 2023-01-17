import { BatchMultiSigCall } from "../batchMultiSigCall";

export async function getPluginData(this: BatchMultiSigCall, index?: number) {
  const plugin = await this.getPlugin(index);
  const call = this.getCall(index);

  return {
    plugin,
    protocol: plugin.protocol,
    type: plugin.type,
    method: plugin.method,
    input: {
      to: call.to,
      value: call.value,
      ...call.params.reduce((acc, param) => {
        return { ...acc, [`methodParams.${param.name}`]: param.value };
      }, {}),
    },
  };
}
