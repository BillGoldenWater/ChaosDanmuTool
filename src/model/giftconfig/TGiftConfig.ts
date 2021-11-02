import { TGiftInfo } from "./TGiftInfo";

export type TGiftConfig = {
  data: Map<number, TGiftInfo>;
};

export function parseGiftConfig(
  giftConfigRes: TGiftConfigResponse
): TGiftConfig {
  const giftConfig: TGiftConfig = { data: new Map<number, TGiftInfo>() };

  for (const i in giftConfigRes.data.list) {
    const giftInfo: TGiftInfo = giftConfigRes.data.list[i];
    giftConfig.data.set(giftInfo.id, giftInfo);
  }

  return giftConfig;
}

export type TGiftConfigResponse = {
  code: number;
  message: string;
  ttl: number;
  data: {
    list: TGiftInfo[];
    combo_resources: [];
    guard_resources: [];
  };
};
