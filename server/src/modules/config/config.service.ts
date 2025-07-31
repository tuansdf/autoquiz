import { CustomException } from "../../custom-exception";
import { configRepository } from "./config.repository";
import type { Config, NewConfig } from "./config.type";

const cache = new Map<string, string | null>();

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
    cache.set(result?.key || "", result?.value || null);
    return result;
  }

  public async update(request: Config): Promise<Config | null> {
    const result = await configRepository.update(request);
    cache.set(result?.key || "", result?.value || null);
    return result;
  }

  public async findValueByKey(key: string): Promise<string | null> {
    if (!key) return null;
    const cached = cache.get(key);
    if (typeof cached === "string" || cached === null) return cached;
    const result = await configRepository.findTopByKey(key);
    if (!result) return null;
    cache.set(key, result.value || null);
    return result.value || null;
  }
}

export const configService = new ConfigService();
