import { configService } from "./config.service.js";

class RemoteConfigs {
  public async isRegistrationEnabled(): Promise<boolean> {
    const result = await configService.findValueByKey("IS_REGISTRATION_ENABLED");
    return result === "true";
  }
}

export const remoteConfigs = new RemoteConfigs();
