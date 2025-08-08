import { configService } from "./config.service.js";

class RemoteConfigs {
  public async isRegistrationEnabled(): Promise<boolean> {
    const result = await configService.findValueByKey("IS_REGISTRATION_ENABLED");
    return result === "true";
  }

  public async getLLMModel(): Promise<string> {
    return configService.findValueByKey("LLM_MODEL");
  }

  public async getLLMInstruction(): Promise<string> {
    return configService.findValueByKey("LLM_INSTRUCTION");
  }
}

export const remoteConfigs = new RemoteConfigs();
