/*
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

export const emptyUserInfo = {
  face: "",
  face_frame: "",
  guard_level: 0,
  is_main_vip: 0,
  is_svip: 0,
  is_vip: 0,
  level_color: "",
  manager: 0,
  name_color: "",
  title: "",
  uname: "",
  user_level: 0,
};
