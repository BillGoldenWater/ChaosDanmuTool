export type TRoomRealTimeMessageUpdate = {
  cmd: "ROOM_REAL_TIME_MESSAGE_UPDATE";
  data: {
    roomid: number;
    fans: number;
    red_notice: number;
    fans_club: number;
  };
};
