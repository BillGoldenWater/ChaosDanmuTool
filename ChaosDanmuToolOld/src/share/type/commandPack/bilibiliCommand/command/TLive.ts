/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export type TLive = {
  cmd: "LIVE";
  live_key: string;
  voice_background: string;
  sub_session_key: string;
  live_platform: string;
  live_model: number;
  roomid: number;
};

export function getLiveCommand(roomid: number): TLive {
  return {
    cmd: "LIVE",
    live_key: "",
    voice_background: "",
    sub_session_key: "",
    live_platform: "",
    live_model: 0,
    roomid: roomid,
  };
}
