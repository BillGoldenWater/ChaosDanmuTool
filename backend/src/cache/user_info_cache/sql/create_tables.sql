/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

create table if not exists user_info
(
  uid        text not null
    constraint user_info_pk
      primary key,
  name       text,
  userLevel  integer,

  face       text,
  faceFrame  text,

  isVip      integer,
  isSvip     integer,
  isMainVip  integer,
  isManager  integer,

  title      text,
  levelColor text,
  nameColor  text,

  hasMedal   integer
);

create table if not exists medal_info
(
  targetId     text not null -- anchorUid
    constraint medal_info_pk
      primary key,

  anchorRoomid integer,
  anchorName   text,
  medalName    text
);

create table if not exists medal_data
(
  uid         text not null
    constraint medal_data_pk
      primary key,
  targetId    text not null, -- anchorUid

  isLighted   integer default 0,
  guardLevel  integer,
  level       integer,

  color       integer,
  colorBorder integer,
  colorEnd    integer,
  colorStart  integer
);