import { DanmuMessage } from "../utils/command/DanmuMessage";
import { EmojiData } from "./EmojiData";
import { MedalInfo } from "./MedalInfo";

export type DanmuMsg = {
  fontsize: number;
  color: number;
  timestamp: number;
  emojiData: EmojiData;

  content: string;

  uid: number;
  uName: string;
  isAdmin: number;
  isVip: number;
  isSVip: number;

  medalInfo: MedalInfo;

  userUL: number;

  userTitle: string;
  userTitle1: string;
};

export function parseDanmuMsg(data: DanmuMessage): DanmuMsg {
  const danmuMsg: DanmuMsg = <DanmuMsg>{};
  const danmuMsgRaw: unknown[] = <unknown[]>data.info;

  const danmuMeta: unknown[] = <unknown[]>danmuMsgRaw[0];
  if (danmuMeta) {
    danmuMsg.fontsize = <number>danmuMeta[2];
    danmuMsg.color = <number>danmuMeta[3];
    danmuMsg.timestamp = <number>danmuMeta[4];
    danmuMsg.emojiData = <EmojiData>danmuMeta[13];
  }

  danmuMsg.content = <string>danmuMsgRaw[1];

  const userData: unknown[] = <unknown[]>danmuMsgRaw[2];
  if (userData) {
    danmuMsg.uid = <number>userData[0];
    danmuMsg.uName = <string>userData[1];
    danmuMsg.isAdmin = <number>userData[2];
    danmuMsg.isVip = <number>userData[3];
    danmuMsg.isSVip = <number>userData[4];
  }

  const medalInfo: unknown[] = <unknown[]>danmuMsgRaw[3];
  if (medalInfo) {
    const tempMedalInfo: MedalInfo = <MedalInfo>{};

    if (medalInfo && medalInfo.length > 0) {
      tempMedalInfo.medal_level = <number>medalInfo[0];
      tempMedalInfo.medal_name = <string>medalInfo[1];
      tempMedalInfo.anchor_uname = <string>medalInfo[2];
      tempMedalInfo.anchor_roomid = <number>medalInfo[3];
      tempMedalInfo.medal_color = <number>medalInfo[4];
      tempMedalInfo.medal_color_border = <number>medalInfo[7];
      tempMedalInfo.medal_color_start = <number>medalInfo[8];
      tempMedalInfo.medal_color_end = <number>medalInfo[9];
      tempMedalInfo.guard_level = <number>medalInfo[10];
      tempMedalInfo.is_lighted = <number>medalInfo[11];
    } else {
      tempMedalInfo.is_lighted = 0;
    }

    danmuMsg.medalInfo = tempMedalInfo;
  }

  const levelInfo: unknown[] = <unknown[]>danmuMsgRaw[4];
  if (levelInfo) {
    danmuMsg.userUL = <number>levelInfo[0];
  }

  const titleInfo: unknown[] = <unknown[]>danmuMsgRaw[5];
  if (titleInfo && titleInfo.length > 0) {
    danmuMsg.userTitle = <string>titleInfo[0];
    danmuMsg.userTitle1 = <string>titleInfo[1];
  }

  return danmuMsg;
}
