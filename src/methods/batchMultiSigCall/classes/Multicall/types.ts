import { Param } from "../../../../types";

export interface IMulticall {
  target: string;
  callType: "ACTION" | "VIEW_ONLY";
  method: string;
  params: Param[];
}
