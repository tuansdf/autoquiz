import type { CommonResponse } from "@/type/common.type.js";

export type Config = {
  key?: string;
  value?: string;
};

export type GetConfigsResponse = CommonResponse<Config[]>;
export type GetConfigResponse = CommonResponse<Config>;
