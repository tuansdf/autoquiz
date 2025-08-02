import { CustomException } from "../../custom-exception";
import { configRepository } from "./config.repository";
import type { Config, NewConfig } from "./config.type";

const cache = new Map<string, string>();

class ConfigService {
  public async findTopByKey(key: string): Promise<Config | null> {
    return configRepository.findTopByKey(key);
  }

  public async findAll(): Promise<Config[] | null> {
    return configRepository.findAll();
  }

  public async create(request: NewConfig): Promise<Config | null> {
    if (await configRepository.existsByKey(request.key)) {
      throw new CustomException("Key existed");
    }
    const result = await configRepository.insert(request);
    if (result) {
      cache.set(result.key, result.value || "");
    }
    return result;
  }

  public async update(request: Config): Promise<Config | null> {
    const result = await configRepository.update(request);
    if (result) {
      cache.set(result.key, result.value || "");
    }
    return result;
  }

  public async findValueByKey(key: string): Promise<string> {
    if (!key) return "";
    const cached = cache.get(key);
    if (typeof cached === "string") return cached;
    const result = await configRepository.findTopByKey(key);
    if (!result) return "";
    cache.set(key, result.value || "");
    return result.value || "";
  }
}

export const configService = new ConfigService();
