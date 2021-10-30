import { GiftInfo } from "./GiftInfo";

export type GiftConfig = {
  data: Map<number, GiftInfo>;
};

export function parseGiftConfig(giftConfigRes: GiftConfigResponse): GiftConfig {
  const giftConfig: GiftConfig = { data: new Map<number, GiftInfo>() };

  for (const i in giftConfigRes.data.list) {
    const giftInfo: GiftInfo = giftConfigRes.data.list[i];
    giftConfig.data.set(giftInfo.id, giftInfo);
  }

  return giftConfig;
}

export type GiftConfigResponse = {
  code: number;
  message: string;
  ttl: number;
  data: {
    list: GiftInfo[];
    combo_resources: [];
    guard_resources: [];
  };
};
