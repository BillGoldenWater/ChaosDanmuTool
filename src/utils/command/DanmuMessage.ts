export type DanmuMessage = {
  cmd: string;
  [key: string]: unknown;
};

export type DanmuMessageWithKey = {
  key: number;
  msg: DanmuMessage;
};
