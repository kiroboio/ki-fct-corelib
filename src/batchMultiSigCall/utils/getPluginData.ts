import { BatchMultiSigCall } from "../batchMultiSigCall";

export async function getPluginData(this: BatchMultiSigCall, index: number) {
  const plugin = await this.getPlugin(index);
  const call = this.getCall(index);

  return {
    protocol: plugin.protocol,
    type: plugin.type,
    method: plugin.method,
    input: {
      to: call.to,
      value: call.value,
      methodParams: call.params
        ? call.params.reduce((acc, param) => {
            return { ...acc, [param.name]: param.value };
          }, {})
        : {},
    },
  };
}
