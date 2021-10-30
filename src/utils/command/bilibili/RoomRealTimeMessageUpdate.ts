export type RoomRealTimeMessageUpdate = {
  cmd: string;
  data: {
    roomid: number;
    fans: number;
    red_notice: number;
    fans_club: number;
  };
};
