import { Param } from "../../../../types";

export interface IMulticall {
  target: string;
  callType: "action" | "view only";
  method: string;
  params: Param[];
}
