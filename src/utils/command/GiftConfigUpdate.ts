import { TGiftConfigResponse } from "../../model/giftconfig/TGiftConfig";

export type GiftConfigUpdateCmd = "updateGiftConfig";

export type GiftConfigUpdate = {
  cmd: GiftConfigUpdateCmd;
  data: TGiftConfigResponse;
};

export function getGiftConfigUpdateMessage(
  giftConfig: TGiftConfigResponse
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
