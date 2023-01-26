import { getPlugin as getPluginProvider, PluginInstance } from "@kirobo/ki-eth-fct-provider-ts";
import { BatchMultiSigCall } from "batchMultiSigCall/batchMultiSigCall";
export declare function getPlugin(this: BatchMultiSigCall, index: number): Promise<PluginInstance>;
export declare function getPluginClass(this: BatchMultiSigCall, index: number): Promise<ReturnType<typeof getPluginProvider>>;
