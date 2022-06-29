/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export type TUserInfo = {
  face: string;
  face_frame: string;
  guard_level: number;
  is_main_vip: number;
  is_svip: number;
  is_vip: number;
  level_color: string;
  manager: number;
  name_color: string;
  title: string;
  uname: string;
  user_level: number;
};

export function getUserInfo(
  face = "",
  face_frame = "",
  guard_level = 0,
  is_main_vip = 0,
  is_svip = 0,
  is_vip = 0,
  level_color = "",
  manager = 0,
  name_color = "",
  title = "",
  uname = "[CDT]",
  user_level = 0
): TUserInfo {
  return {
    face: face,
    face_frame: face_frame,
    guard_level: guard_level,
    is_main_vip: is_main_vip,
    is_svip: is_svip,
    is_vip: is_vip,
    level_color: level_color,
    manager: manager,
    name_color: name_color,
    title: title,
    uname: uname,
    user_level: user_level,
  };
}
