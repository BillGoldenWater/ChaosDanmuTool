export type TGuardBuy = {
  cmd: "GUARD_BUY";
  data: {
    uid: number;
    username: string;
    guard_level: number;
    num: number;
    price: number;
    gift_id: number;
    gift_name: string;
    start_time: number;
    end_time: number;
  };
};