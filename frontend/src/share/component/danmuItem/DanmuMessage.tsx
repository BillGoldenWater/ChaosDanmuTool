/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { TDanmuItemProps } from "./DanmuItem";

import { UserMessage } from "./UserMessage";
import styled from "styled-components";
import { DanmuMessage } from "../../type/rust/command_packet/bilibili_command/danmu_message";

export function DanmuMessage(props: TDanmuItemProps) {
  const {
    info: { item, mergePrev, mergeNext },
  } = props;

  const dm = item.data.data as DanmuMessage;
  const showSpecial = false; // todo config

  if (dm.isSpecialType && !showSpecial) {
    return null;
  }

  const uid = dm.uid;

  let content: JSX.Element | (JSX.Element | string)[] = [dm.content];

  for (const emot of dm.emots.values()) {
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
    const emoji = dm.emojiData;
    const emojiHeight = `calc( 64rem * ${emoji.height / emoji.width} )`;

    if (emoji.url.indexOf("http") === 0) {
      content = (
        <Emoji
          src={emoji.url}
          alt={emoji.text}
          style={{
            height: emojiHeight,
          }}
        />
      );
    } else {
      content = [emoji.url];
    }
  }

  return (
    <UserMessage
      uid={uid}
      mergePrev={mergePrev}
      mergeNext={mergeNext}
      timestamp={dm.timestamp}
      highlightColor={
        dm.bubbleColor !== "" ? dm.bubbleColor.slice(0, -2) : "#00000000"
      }
    >
      {content}
    </UserMessage>
  );
}

const Emoji = styled.img`
  display: block;
  max-width: 64rem;
`;

const Emot = styled.img`
  height: 24rem;
`;
