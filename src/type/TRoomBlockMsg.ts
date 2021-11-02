export type TRoomBlockMsg = {
  cmd: "ROOM_BLOCK_MSG";
  data: {
    dmscore: number;
    operator: number;
    uid: number;
    uname: string;
  };
  uid: string;
  uname: string;
};
