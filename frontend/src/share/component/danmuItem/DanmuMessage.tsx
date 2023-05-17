/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { TDanmuItemProps } from "./DanmuItem";

import { UserMessage } from "./UserMessage";
import styled from "styled-components";
import { DanmuMessage } from "../../type/rust/command_packet/bilibili_command/danmu_message";
import { Property } from "csstype";
import { useMemo } from "react";
import { Emot as TEmot } from "../../type/rust/types/bilibili/emot";

export function DanmuMessage(props: TDanmuItemProps) {
  const {
    info: { item, mergePrev, mergeNext },
  } = props;
  const showSpecial = false; // todo config
  const dm = item.data.data as DanmuMessage;
  const uid = dm.uid;

  const content = useMemo(() => {
    if (dm.emojiData) {
      const emoji = dm.emojiData;
      const emojiHeight: Property.Height = `calc( 64rem * ${
        emoji.height / emoji.width
      } )`;

      if (emoji.url.indexOf("http") === -1) {
        return emoji.url;
      }

      return <Emoji src={emoji.url} alt={emoji.text} $height={emojiHeight} />;
    }

    if (dm.emots.size === 0) return dm.content;

    const emotResult = parseEmot(dm.emots, dm.content);

    if (emotResult == null) return dm.content;

    return emotResult.map((v, idx) => <span key={idx}>{v}</span>);
  }, [dm.content, dm.emojiData, dm.emots]);

  if (dm.isSpecialType && !showSpecial) return null;

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

const Emoji = styled.img<{ $height: Property.Height }>`
  display: block;
  max-width: 64rem;
  height: ${(p) => p.$height};
`;

const Emot = styled.img`
  height: 24rem;
`;

function parseEmot(emots: Map<string, TEmot>, str: string) {
  const result = [];

  let lastIdx = 0;
  for (let idx = 0; idx < str.length; idx++) {
    if (str[idx] === "[") {
      const emotData = getEmotAt(str, idx);
      if (emotData == null) continue;

      const emot = emots.get(emotData.emot);
      if (emot == null) continue;

      result.push(str.slice(lastIdx, idx));
      result.push(<Emot src={emot.url} alt={emot.emoji} />);
      lastIdx = idx + emotData.length;
    }
  }

  if (result.length === 0) {
    return null;
  }

  result.push(str.slice(lastIdx));
  return result;
}

function getEmotAt(
  str: string,
  idx: number
): { emot: string; length: number } | null {
  const endIdx = str.indexOf("]", idx);
  if (endIdx === -1) return null;

  return {
    emot: str.slice(idx, endIdx + 1),
    length: endIdx - idx + 1,
  };
}
