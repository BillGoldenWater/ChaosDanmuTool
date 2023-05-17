/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { PropsWithChildren, useContext, useMemo } from "react";
import { appCtx } from "../../app/AppCtx";
import styled, { css } from "styled-components";
import { UserAvatar } from "../userInfo/UserAvatar";
import { UserInfo } from "../userInfo/UserInfo";
import { UserInfo as TUserInfo } from "../../type/rust/types/user_info";
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
  timestamp: string;
  highlightColor: string;
}

export function UserMessage(props: PropsWithChildren<UserMessageProps>) {
  const { children, uid, timestamp, mergePrev, mergeNext, highlightColor } =
    props;
  const ctx = useContext(appCtx);
  const userInfo = ctx.getUserInfo(uid);
  const compact = false;

  // region sider
  const sider = useMemo(() => {
    if (compact) return null;
    return (
      <MessageSider
        userInfo={userInfo}
        timestamp={timestamp}
        isAvatar={!mergePrev}
      />
    );
  }, [compact, mergePrev, timestamp, userInfo]);
  // endregion

  // region msgUserInfo
  const msgUserInfo = useMemo(() => {
    if (mergePrev) return null;
    return (
      <div>
        <UserInfo userInfo={userInfo} showAvatar={compact} />
      </div>
    );
  }, [compact, mergePrev, userInfo]);
  // endregion

  return (
    <UserMessageContainer
      $mergePrev={mergePrev}
      $mergeNext={mergeNext}
      $highlightColor={highlightColor}
    >
      {sider}
      <MessageMain>
        {msgUserInfo}
        <MessageContent>{children}</MessageContent>
      </MessageMain>
    </UserMessageContainer>
  );
}

function MessageSider(props: {
  isAvatar: boolean;
  userInfo: TUserInfo;
  timestamp: string;
}) {
  const { isAvatar, userInfo, timestamp } = props;

  const content = useMemo(() => {
    if (isAvatar) {
      return <UserAvatar userInfo={userInfo} size={"40rem"} />;
    } else {
      const ts = new Date(Number.parseInt(timestamp));
      const timeStr = formatTime(ts, "{hours}:{minutes}");
      return <MessageTimestamp>{timeStr}</MessageTimestamp>;
    }
  }, [isAvatar, userInfo, timestamp]);

  return (
    <MessageSiderContainer $isAvatar={isAvatar}>
      {content}
    </MessageSiderContainer>
  );
}

const MessageSiderContainer = styled.div<{ $isAvatar: boolean }>`
  display: flex;
  flex-direction: column;

  align-items: ${(p) => (p.$isAvatar ? "" : "center")};
  justify-content: ${(p) => (p.$isAvatar ? "" : "center")};

  min-width: 40rem;

  container-type: size;
`;

const MessageTimestamp = styled.div`
  ${font.dmTs};
  display: flex;
  align-items: center;

  height: 100%;

  color: ${color.txtSecond};

  // note: intellij formatter would break this (WEB-59064)
  @container (height > 20rem) {
    align-items: flex-end;
  }
`;

const MessageMain = styled.div`
  display: flex;
  flex-direction: column;
  gap: calc(${paddingValue.small} / 2);
`;

const MessageContent = styled.div`
  ${font.dmContent};
  text-shadow: 0 0 3rem #000;
  word-wrap: anywhere;
  word-break: break-all;
`;

interface UserMessageBaseProps {
  $mergePrev: boolean;
  $mergeNext: boolean;
  $highlightColor: string;
}

const styleMergePrev = css`
  padding-top: calc(${paddingValue.small} / 2);

  border-top-width: 0;
  border-top-left-radius: 0;
  border-top-right-radius: 0;
`;

const styleMergeNext = css`
  padding-bottom: calc(${paddingValue.small} / 2);

  border-bottom-width: 0;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
`;

const UserMessageContainer = styled.div<UserMessageBaseProps>`
  transition: background-color 0.15s ease-in-out;
  display: flex;
  gap: ${paddingValue.small};

  ${radius.normal};
  ${border.normal};
  ${padding.small};
  ${(p) => (!p.$mergePrev ? `margin-top: ${paddingValue.small};` : "")}

  border-color: ${(p) => p.$highlightColor};
  ${(p) => (p.$mergePrev ? styleMergePrev : "")};
  ${(p) => (p.$mergeNext ? styleMergeNext : "")};

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
