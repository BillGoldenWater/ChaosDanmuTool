import { TFansMedal } from "./TFansMedal";
import { TMedal } from "./TMedal";

export type TMedalInfo = TFansMedal & {
  anchor_uname: string;
};

export function parseMedalInfo(medal: TMedal): TMedalInfo {
  const medalInfo: TMedalInfo = <TMedalInfo>{};

  if (medal && medal.length > 0) {
    medalInfo.medal_level = <number>medal[0];
    medalInfo.medal_name = <string>medal[1];
    medalInfo.anchor_uname = <string>medal[2];
    medalInfo.anchor_roomid = <number>medal[3];
    medalInfo.medal_color = <number>medal[4];
    medalInfo.medal_color_border = <number>medal[7];
    medalInfo.medal_color_start = <number>medal[8];
    medalInfo.medal_color_end = <number>medal[9];
    medalInfo.guard_level = <number>medal[10];
    medalInfo.is_lighted = <number>medal[11];
  } else {
    medalInfo.is_lighted = 0;
  }

  return medalInfo;
}
