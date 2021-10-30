import { GiftConfigResponse } from "../../model/giftconfig/GiftConfig";

export type GiftConfigUpdateCmd = "updateGiftConfig";

export type GiftConfigUpdate = {
  cmd: GiftConfigUpdateCmd;
  data: GiftConfigResponse;
};

export function getGiftConfigUpdateMessage(
  giftConfig: GiftConfigResponse
): string {
  const messageObj: GiftConfigUpdate = {
    cmd: "updateGiftConfig",
    data: giftConfig,
  };

  return JSON.stringify(messageObj);
}

export function getGiftConfigUpdateCmd(): GiftConfigUpdateCmd {
  return "updateGiftConfig";
}
