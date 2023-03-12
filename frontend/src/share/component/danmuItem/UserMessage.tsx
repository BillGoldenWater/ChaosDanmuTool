/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { PropsWithChildren, useContext } from "react";
import { appCtx } from "../../app/AppCtx";
import styled from "styled-components";
import { UserAvatar } from "../userInfo/UserAvatar";
import { UserInfo } from "../userInfo/UserInfo";
import { color, font, paddingValue, radius } from "../ThemeCtx";
import { formatTime } from "../../utils/FormatUtils";

interface UserMessageProps {
  uid?: string;
  timestamp?: string;
  highlight?: boolean;
}

export function UserMessage(props: PropsWithChildren<UserMessageProps>) {
  const { children, uid, timestamp, highlight } = props;
  const hasPrev = uid == null;

  const ctx = useContext(appCtx);

  const compact = false;

  let sider = <></>;
  let msgUserInfo = <></>;

  if (uid) {
    const userInfo = ctx.getUserInfo(uid);

    sider = <UserAvatar userInfo={userInfo} size={"2.25rem"} />;
    msgUserInfo = (
      <MessageUserInfo>
        <UserInfo userInfo={userInfo} showAvatar={compact} />
      </MessageUserInfo>
    );
  } else if (timestamp) {
    const ts = new Date(Number.parseInt(timestamp));
    const timeStr = formatTime(ts, "{hours}:{minutes}");
    sider = <MessageTimestamp>{timeStr}</MessageTimestamp>;
  }

  return (
    <UserMessageBase hasPrev={hasPrev} highlight={highlight === true}>
      {!compact && <MessageSider isAvatar={uid != null}>{sider}</MessageSider>}
      <MessageMain>
        {msgUserInfo}
        <MessageContent>{children}</MessageContent>
      </MessageMain>
    </UserMessageBase>
  );
}

const MessageSider = styled.div<{ isAvatar: boolean }>`
  display: flex;

  ${(p) => (p.isAvatar ? "" : "align-items: center;")};
  justify-content: center;

  width: 2.5rem;
`;

const MessageTimestamp = styled.div`
  ${font.dmTs};

  color: ${color.txtSecond};
`;

const MessageMain = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${paddingValue.small};
`;

const MessageUserInfo = styled.div``;

const MessageContent = styled.div`
  text-shadow: 0 0 0.15rem #000;
  word-wrap: anywhere;
  word-break: break-all;
`;

interface UserMessageBaseProps {
  hasPrev: boolean;
  highlight: boolean;
}

const UserMessageBase = styled.div<UserMessageBaseProps>`
  transition: background-color 0.15s ease-in-out;
  display: flex;
  gap: ${paddingValue.small};

  ${radius.small};

  ${(p) =>
    p.hasPrev ? `margin-top: calc(-0.85 * ${paddingValue.normal});` : ""};

  background-color: ${(p) => (p.highlight ? color.bgTheme : "transparent")};

  &:hover {
    background-color: ${(p) => (p.highlight ? color.bgThHover : color.bgItem)};
  }

  & ${MessageTimestamp} {
    transition: opacity 0.15s ease-in-out;
    opacity: 0;
  }

  &:hover ${MessageTimestamp} {
    opacity: 1;
  }
`;
