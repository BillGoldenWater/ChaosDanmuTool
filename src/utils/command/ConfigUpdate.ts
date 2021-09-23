import { Config } from "../Config";

export type ConfigUpdate = {
  cmd: "updateConfig";
  data: Config;
};

export function getConfigUpdateMessage(config: Config): string {
  const messageObj: ConfigUpdate = {
    cmd: "updateConfig",
    data: config,
  };

  return JSON.stringify(messageObj);
}
