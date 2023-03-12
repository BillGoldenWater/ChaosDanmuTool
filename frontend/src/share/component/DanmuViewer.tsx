/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import styled from "styled-components";
import { padding, paddingValue } from "./ThemeCtx";
import { useContext, useEffect, useRef, useState } from "react";
import { appCtx } from "../app/AppCtx";
import { BiliBiliMessageEvent } from "../event/AppEventTarget";
import { CommandPacket } from "../type/rust/command/CommandPacket";
import { DanmuItem } from "./danmuItem/DanmuItem";
import { motion, MotionValue, useSpring } from "framer-motion";
import { maxScrollTop } from "../utils/ElementUtils";
import { DanmuViewerMaxSize } from "../app/Settings";
import Immutable from "immutable";

export function DanmuViewer() {
  const ctx = useContext(appCtx);

  // region hover
  const [hover, setHover] = useState(false);
  useEffect(() => {
    function onWindowBlur() {
      setHover(false);
    }

    window.addEventListener("blur", onWindowBlur);

    return () => {
      window.removeEventListener("blur", onWindowBlur);
    };
  }, [hover]);
  // endregion

  // region list
  const [msgList, setMsgList] = useState<Immutable.List<CommandPacket>>(
    Immutable.List
  );
  const [msgListBuf, setMsgListBuf] = useState<Immutable.List<CommandPacket>>(
    Immutable.List
  );

  useEffect(() => {
    function onBiliBiliMessage(event: BiliBiliMessageEvent) {
      setMsgListBuf((list) => list.push(event.message));
    }

    ctx.eventTarget.addEventListener("bilibiliMessage", onBiliBiliMessage);

    return () =>
      ctx.eventTarget.removeEventListener("bilibiliMessage", onBiliBiliMessage);
  }, [ctx.eventTarget]);

  useEffect(() => {
    if (msgListBuf.size === 0) return;

    const id = window.setTimeout(() => {
      setMsgList((list) => {
        const newList = list.push(...msgListBuf);
        setMsgListBuf(msgListBuf.clear());
        return newList.slice(
          Math.max(newList.size - DanmuViewerMaxSize, 0),
          newList.size
        );
      });
    }, 10);

    return () => window.clearTimeout(id);
  }, [msgListBuf]);
  // endregion

  // region scroll
  const [listRef, setListRef] = useState<HTMLDivElement | null>(null);
  const listScroll: MotionValue<number> = useSpring(0, {
    stiffness: 120,
    damping: 20,
  });

  const prevElement = useRef<HTMLDivElement>();
  const prevHover = useRef(false);
  const [latestElement, setLatestElement] = useState<HTMLDivElement | null>(
    null
  );
  const msgListReachedMaxSize = msgList.size === DanmuViewerMaxSize;
  useEffect(() => {
    if (!latestElement || !listRef) return;
    if (prevElement.current) {
      const offsetBottom = latestElement.offsetTop + latestElement.offsetHeight;
      const prevOffsetBottom =
        prevElement.current.offsetTop + prevElement.current.offsetHeight;
      const heightAppended = offsetBottom - prevOffsetBottom;

      const isHoverChanged = prevHover.current !== hover;

      if (!hover && !isHoverChanged) {
        listScroll.jump(listScroll.get() + heightAppended);
        listScroll.set(0);
      } else {
        const currentScrollBottom = maxScrollTop(listRef) - listRef.scrollTop;

        if (msgListReachedMaxSize) {
          const newScrollBottom = Math.min(
            currentScrollBottom + heightAppended,
            listRef.scrollHeight
          );

          listScroll.jump(newScrollBottom);
        } else {
          listScroll.jump(currentScrollBottom);
        }

        if (isHoverChanged && !hover) {
          listScroll.set(0);
        }
      }
    }

    prevHover.current = hover;
    prevElement.current = latestElement;
  }, [hover, latestElement, listRef, listScroll, msgListReachedMaxSize]);

  useEffect(() => {
    if (!listRef) return;
    return listScroll.on("change", (value) => {
      listRef.scrollTo({
        top: maxScrollTop(listRef) - value,
      });
    });
  }, [listRef, listScroll]);
  // endregion

  return (
    <DanmuViewerBase
      ref={setListRef}
      onHoverStart={setHover.bind(null, true)}
      onHoverEnd={setHover.bind(null, false)}
    >
      <div />
      {msgList.map((item, idx, arr) => {
        const prev = idx > 0 ? arr.get(idx - 1) : undefined;
        const next = idx < arr.size - 1 ? arr.get(idx + 1) : undefined;
        return (
          <DanmuItemContainer
            key={item.uuid}
            ref={idx === arr.size - 1 ? setLatestElement : undefined}
          >
            <DanmuItem item={item} prevItem={prev} nextItem={next} />
          </DanmuItemContainer>
        );
      })}
    </DanmuViewerBase>
  );
}

const DanmuViewerBase = styled(motion.div)`
  ${padding.normal};

  display: grid;
  grid-template-rows: auto;
  grid-auto-rows: max-content;

  height: 100%;
  width: 100%;

  overflow-y: hidden;
  overflow-x: hidden;

  &:hover {
    overflow-y: scroll;
  }

  gap: ${paddingValue.normal};
`;

const DanmuItemContainer = styled(motion.div)`
  position: relative;
`;
