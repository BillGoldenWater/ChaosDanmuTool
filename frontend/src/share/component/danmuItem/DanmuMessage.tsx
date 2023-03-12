/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { TDanmuItemProps } from "./DanmuItem";
import { DanmuMessage } from "../../type/rust/command/commandPacket/bilibiliCommand/DanmuMessage";
import { UserMessage } from "./UserMessage";
import styled from "styled-components";
import { appCtx } from "../../app/AppCtx";
import { useContext } from "react";

export function DanmuMessage(props: TDanmuItemProps) {
  const { item, prevItem } = props;

  const ctx = useContext(appCtx);

  const dm = item.data.data as DanmuMessage;
  const showSpecial = false; // todo config

  if (dm.isSpecialType && !showSpecial) {
    return null;
  }

  const userInfo = ctx.getUserInfo(dm.uid);
  let uid: string | undefined = dm.uid;

  if (
    prevItem &&
    prevItem.cmd === "biliBiliCommand" &&
    prevItem.data.cmd === "danmuMessage" &&
    prevItem.data.data.uid === uid
  ) {
    uid = undefined;
  }

  let content: JSX.Element | (JSX.Element | string)[] = [dm.content];

  for (const emotKey in dm.emots) {
    const emot = dm.emots[emotKey];
    content = content.flatMap((it) => {
      if (typeof it === "string") {
        return it
          .split(emot.emoji)
          .flatMap((v, idx, arr) =>
            idx === arr.length - 1
              ? [v]
              : [v, <Emot src={emot.url} alt={emot.emoji} />]
          );
      } else {
        return it;
      }
    });
  }

  content = content.map((v, idx) => <span key={idx}>{v}</span>);

  if (dm.emojiData) {
    content = <Emoji src={dm.emojiData.url} alt={dm.emojiData.text} />;
  }

  return (
    <UserMessage
      uid={uid}
      timestamp={dm.timestamp}
      highlight={
        userInfo.medal && userInfo.medal.guardLevel
          ? userInfo.medal.guardLevel > 0
          : false
      }
    >
      {content}
    </UserMessage>
  );
}

const Emoji = styled.img`
  max-width: 4rem;
`;

const Emot = styled.img`
  max-width: 1.5rem;
`;
