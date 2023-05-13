/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { PropsWithChildren, useContext } from "react";
import { appCtx } from "../../app/AppCtx";
import styled, { css } from "styled-components";
import { UserAvatar } from "../userInfo/UserAvatar";
import { UserInfo } from "../userInfo/UserInfo";
import {
  border,
  color,
  font,
  padding,
  paddingValue,
  radius,
} from "../ThemeCtx";
import { formatTime } from "../../utils/FormatUtils";

export interface UserMessageProps {
  uid: string;
  mergePrev: boolean;
  mergeNext: boolean;
  timestamp?: string;
  highlightColor: string;
}

export function UserMessage(props: PropsWithChildren<UserMessageProps>) {
  const { children, uid, timestamp, mergePrev, mergeNext, highlightColor } =
    props;

  const ctx = useContext(appCtx);

  const compact = false;

  let sider = <></>;
  let msgUserInfo = <></>;

  const userInfo = ctx.getUserInfo(uid);

  if (!mergePrev) {
    sider = <UserAvatar userInfo={userInfo} size={"2.5rem"} />;
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
    <UserMessageBase
      $mergePrev={mergePrev}
      $mergeNext={mergeNext}
      $highlightColor={highlightColor}
    >
      {!compact && <MessageSider $isAvatar={!mergePrev}>{sider}</MessageSider>}
      <MessageMain>
        {msgUserInfo}
        <MessageContent>{children}</MessageContent>
      </MessageMain>
    </UserMessageBase>
  );
}

const MessageSider = styled.div<{ $isAvatar: boolean }>`
  display: flex;

  ${(p) =>
    p.$isAvatar ? "align-items: flex-start;" : "align-items: flex-end;"};
  justify-content: ${(p) => (p.$isAvatar ? "start" : "center")};

  min-width: 2.5rem;
`;

const MessageTimestamp = styled.div`
  ${font.dmTs};
  display: flex;
  align-items: center;

  color: ${color.txtSecond};

  height: min(1rem, 100%);
`;

const MessageMain = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${paddingValue.small};
`;

const MessageUserInfo = styled.div``;

const MessageContent = styled.div`
  ${font.dmContent};
  text-shadow: 0 0 0.15rem #000;
  word-wrap: anywhere;
  word-break: break-all;
`;

interface UserMessageBaseProps {
  $mergePrev: boolean;
  $mergeNext: boolean;
  $highlightColor: string;
}

const UserMessageBase = styled.div<UserMessageBaseProps>`
  transition: background-color 0.15s ease-in-out;
  display: flex;
  gap: ${paddingValue.small};

  ${radius.normal};
  ${border.normal};
  ${padding.small};

  border-color: ${(p) => p.$highlightColor};
  ${(p) => {
    if (p.$mergePrev) {
      return css`
        border-top-width: 0;
        border-top-left-radius: 0;
        border-top-right-radius: 0;
      `;
    } else {
      return `margin-top: ${paddingValue.small};`;
    }
  }};
  ${(p) => {
    if (p.$mergeNext) {
      return css`
        border-bottom-width: 0;
        border-bottom-left-radius: 0;
        border-bottom-right-radius: 0;
      `;
    } else {
      return "";
    }
  }};

  background-color: transparent;

  &:hover {
    background-color: ${color.bgItem};
  }

  & ${MessageTimestamp} {
    transition: opacity 0.15s ease-in-out;
    opacity: 0;
  }

  &:hover ${MessageTimestamp} {
    opacity: 1;
  }
`;
