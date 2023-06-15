// Create a type that checks if the input is an instance of IWithPlugin, IMSCallWithEncodedData, or IMSCallInput and return IMSCallInput
import { IMSCallInput, IMSCallWithEncodedData, IWithPlugin, Param } from "../../../../types";
import { FCTCall } from "../../types";

// export type CreateReturn<T extends FCTCall> = T extends IMSCallInput
//   ? T & { nodeId: string }
//   : T extends IMSCallWithEncodedData
//   ? IMSCallInput & { nodeId: string; method: string; params: Param[] }
//   : IMSCallInput & { nodeId: string };

export type CreateReturn<T extends FCTCall> = T extends IMSCallWithEncodedData
  ? IMSCallInput & {
      nodeId: string;
      method: string;
      params: Param[];
      to: T["to"];
      from: T["from"];
      value: T["value"];
      options: T["options"];
    }
  : T extends IWithPlugin
  ? IMSCallInput & { nodeId: string; from: T["from"]; value: T["value"]; options: T["options"] }
  : IMSCallInput & T & { nodeId: string }; // T extends IMSCallInput
