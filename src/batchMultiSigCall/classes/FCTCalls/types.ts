// Create a type that checks if the input is an instance of IWithPlugin, IMSCallWithEncodedData, or IMSCallInput and return IMSCallInput
import { IMSCallWithEncodedData } from "../../../types";
import { FCTCall, IMSCallInput } from "../../types";

export type CreateReturn<T extends FCTCall> = T extends IMSCallInput
  ? T & { nodeId: string }
  : T extends IMSCallWithEncodedData
  ? IMSCallInput & { nodeId: string }
  : IMSCallInput & { nodeId: string };
