/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { PropsWithChildren, useContext, useState } from "react";
import { appCtx } from "../../app/AppCtx";
import styled from "styled-components";
import { UserAvatar } from "../userInfo/UserAvatar";
import { UserInfo } from "../userInfo/UserInfo";
import { color, font, paddingValue, radius } from "../ThemeCtx";
import { motion } from "framer-motion";
import { formatTime } from "../../utils/FormatUtils";

interface UserMessageProps {
  uid?: string;
  timestamp?: string;
}

export function UserMessage(props: PropsWithChildren<UserMessageProps>) {
  const { children, uid, timestamp } = props;
  const hasPrev = uid == null;

  const ctx = useContext(appCtx);
  const [hover, setHover] = useState(false);

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
    sider = (
      <MessageTimestamp hover={hover}>
        {formatTime(ts, "{hours}:{minutes}")}
      </MessageTimestamp>
    );
  }

  return (
    <UserMessageBase
      onHoverStart={setHover.bind(null, true)}
      onHoverEnd={setHover.bind(null, false)}
      hover={hover}
      hasPrev={hasPrev}
    >
      {!compact && <MessageSider>{sider}</MessageSider>}
      <MessageMain>
        {msgUserInfo}
        <MessageContent>{children}</MessageContent>
      </MessageMain>
    </UserMessageBase>
  );
}

const UserMessageBase = styled(motion.div)<{
  hover: boolean;
  hasPrev: boolean;
}>`
  transition: background-color 0.15s ease-in-out;
  display: flex;
  gap: ${paddingValue.small};

  background-color: ${(p) => (p.hover ? color.bgItem : "transparent")};
  ${radius.small};

  ${(p) =>
    p.hasPrev ? `margin-top: calc(-0.85 * ${paddingValue.normal});` : ""};
`;

const MessageSider = styled.div`
  display: flex;

  align-items: center;
  justify-content: center;

  width: 2.5rem;
`;

const MessageTimestamp = styled.div<{ hover: boolean }>`
  transition: opacity 0.15s ease-in-out;

  ${font.dmTs};

  opacity: ${(p) => (p.hover ? 1 : 0)};

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
`;
