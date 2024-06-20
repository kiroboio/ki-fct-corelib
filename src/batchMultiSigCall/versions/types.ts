import { VersionType } from "../types";
import { V020201_ExportOptions } from "./v020201";

export type ExportOptions = V020201_ExportOptions;

export type GenericExportOptions<V extends VersionType> = V extends "0x020201" ? V020201_ExportOptions : ExportOptions;
