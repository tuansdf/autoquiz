import { CustomException } from "../../custom-exception";
import { configRepository } from "./config.repository";
import type { Config, NewConfig } from "./config.type";

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
    return await configRepository.insert(request);
  }

  public async update(request: Config): Promise<Config | null> {
    return await configRepository.update(request);
  }

  public async findValueByKey(key: string): Promise<string> {
    if (!key) return "";
    const result = await configRepository.findTopByKey(key);
    return result?.value || "";
  }
}

export const configService = new ConfigService();
