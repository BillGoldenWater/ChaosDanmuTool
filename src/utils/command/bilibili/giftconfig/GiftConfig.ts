import { GiftInfo } from "./GiftInfo";

export type GiftConfig = {
  code: number;
  message: string;
  ttl: number;
  data: {
    list: GiftInfo[];
    combo_resources: [];
    guard_resources: [];
  };
};
