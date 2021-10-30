import { GiftConfig } from "../../model/giftconfig/GiftConfig";

export type GiftConfigUpdateCmd = "updateGiftConfig";

export type GiftConfigUpdate = {
  cmd: GiftConfigUpdateCmd;
  data: GiftConfig;
};

export function getGiftConfigUpdateMessage(giftConfig: GiftConfig): string {
  const messageObj: GiftConfigUpdate = {
    cmd: "updateGiftConfig",
    data: giftConfig,
  };

  return JSON.stringify(messageObj);
}

export function getGiftConfigUpdateCmd(): GiftConfigUpdateCmd {
  return "updateGiftConfig";
}
