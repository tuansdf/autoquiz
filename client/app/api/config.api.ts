import { apiAuth } from "@/api/instance.api.js";
import type { Config, GetConfigResponse, GetConfigsResponse } from "@/type/config.type.js";

export const createConfig = async (data: Config): Promise<GetConfigResponse> => {
  const result = await apiAuth.post("api/configs", {
    json: data,
  });
  return result.json();
};

export const updateConfig = async (data: Config): Promise<GetConfigResponse> => {
  const result = await apiAuth.patch("api/configs", {
    json: data,
  });
  return result.json();
};

export const getConfigs = async (): Promise<GetConfigsResponse> => {
  const result = await apiAuth.get("api/configs");
  return result.json();
};
