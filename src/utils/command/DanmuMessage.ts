export type DanmuMessage = {
  cmd:
    | string
    | "INTERACT_WORD"
    | "SEND_GIFT"
    | "ROOM_REAL_TIME_MESSAGE_UPDATE"
    | "DANMU_MSG"
    | "SUPER_CHAT_MESSAGE"
    | "ROOM_BLOCK_MSG"
    | "LIVE"
    | "PREPARING"
    | "GUARD_BUY";
  [key: string]: unknown;
};

export type DanmuMessageWithKey = {
  key: number;
  msg: DanmuMessage;
};
