/*
 * SPDX-License-Identifier: AGPL-3.0-only
 */

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
    | "GUARD_BUY"
    //ignore
    | "STOP_LIVE_ROOM_LIST"
    | "COMBO_SEND"
    | "COMMON_NOTICE_DANMAKU"
    | "LIVE_INTERACTIVE_GAME"
    | "NOTICE_MSG"
    | "ROOM_CHANGE"
    | "USER_TOAST_MSG"
    | "WIDGET_BANNER"
    | "PK_BATTLE_END"
    | "PK_BATTLE_ENTRANCE"
    | "PK_BATTLE_FINAL_PROCESS"
    | "PK_BATTLE_PRE"
    | "PK_BATTLE_PRE_NEW"
    | "PK_BATTLE_PROCESS"
    | "PK_BATTLE_PROCESS_NEW"
    | "PK_BATTLE_SETTLE"
    | "PK_BATTLE_SETTLE_USER"
    | "PK_BATTLE_SETTLE_V2"
    | "PK_BATTLE_START"
    | "PK_BATTLE_START_NEW"
    | "ONLINE_RANK_COUNT"
    | "ONLINE_RANK_TOP3"
    | "ONLINE_RANK_V2"
    //planToDo
    | "ENTRY_EFFECT"
    | "ANCHOR_LOT_AWARD"
    | "ANCHOR_LOT_CHECKSTATUS"
    | "ANCHOR_LOT_END"
    | "ANCHOR_LOT_START"
    | "HOT_RANK_CHANGED"
    | "HOT_RANK_SETTLEMENT";
  [key: string]: unknown;
};

export type DanmuMessageWithKey = {
  key: number;
  msg: DanmuMessage;
};
