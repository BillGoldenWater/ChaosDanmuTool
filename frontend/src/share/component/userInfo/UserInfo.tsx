/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { UserInfo } from "../../type/rust/cache/userInfo/UserInfo";
import styled from "styled-components";
import { UserAvatar } from "./UserAvatar";
import { color, font, paddingValue } from "../ThemeCtx";
import { UserMedal } from "./UserMedal";
import { UserInfoIcon } from "./UserInfoIcon";

interface UserInfoProps {
  userInfo: UserInfo;
  showAvatar?: boolean;
}

export function UserInfo(props: UserInfoProps) {
  const { showAvatar, userInfo } = props;
  const { isManager, isSvip, isVip, medal, name } = userInfo;

  const avatar = (showAvatar != null ? showAvatar : true) && (
    <UserAvatar userInfo={userInfo} size={"1.25rem"} />
  );

  const userMedal = medal && medal.isLighted && <UserMedal medalData={medal} />;

  return (
    <UserInfoBase>
      {avatar}
      <UserNameBase>{name}</UserNameBase>
      {userMedal}
      {isManager && <UserInfoIcon color={"#D2A25B"} text={"房"} />}
      {isVip && <UserInfoIcon color={"#DC6385"} text={"爷"} />}
      {isSvip && <UserInfoIcon color={"#E8B800"} text={"爷"} />}
    </UserInfoBase>
  );
}

const UserInfoBase = styled.div`
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  gap: ${paddingValue.small};
`;

const UserNameBase = styled.div`
  display: inline;

  color: ${color.theme};
  ${font.userName};

  word-wrap: anywhere;
  word-break: break-all;
`;
