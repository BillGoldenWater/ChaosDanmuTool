import { Config } from "../Config";

export type ConfigUpdateCmd = "updateConfig";

export type ConfigUpdate = {
  cmd: ConfigUpdateCmd;
  data: Config;
};

export function getConfigUpdateMessage(config: Config): string {
  const messageObj: ConfigUpdate = {
    cmd: "updateConfig",
    data: config,
  };

  return JSON.stringify(messageObj);
}

export function getConfigUpdateCmd(): ConfigUpdateCmd {
  return "updateConfig";
}
