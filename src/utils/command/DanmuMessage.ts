export type DanmuMessage = {
  cmd: string | "DANMU_MSG" | "INTERACT_WORD" | "STOP_LIVE_ROOM_LIST";
  [key: string]: unknown;
};

export type DanmuMessageWithKey = {
  key: number;
  msg: DanmuMessage;
};
