import { Config } from "../config/Config";

export type ConfigUpdateCmd = "updateConfig";

export type ConfigUpdate = {
  cmd: ConfigUpdateCmd;
  data: Config;
};

export function getConfigUpdateMessage(config: Config): ConfigUpdate {
  return {
    cmd: "updateConfig",
    data: config,
  };
}

export function getConfigUpdateCmd(): ConfigUpdateCmd {
  return "updateConfig";
}
