/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import styled from "styled-components";
import { padding, paddingValue } from "./ThemeCtx";
import {
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { appCtx } from "../app/AppCtx";
import { BiliBiliMessageEvent } from "../event/AppEventTarget";
import { CommandPacket } from "../type/rust/command/CommandPacket";
import { DanmuItem } from "./danmuItem/DanmuItem";
import { motion, MotionValue, useSpring } from "framer-motion";
import { maxScrollTop } from "../utils/ElementUtils";
import { DanmuViewerMaxSize } from "../app/Settings";

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
  const [msgList, setMsgList] = useState<CommandPacket[]>([]);

  useEffect(() => {
    function onDanmuMessage(event: BiliBiliMessageEvent) {
      setMsgList((list) => {
        const limitedList = list.slice(
          Math.max(list.length - DanmuViewerMaxSize + 1, 0),
          list.length
        );
        return [...limitedList, event.message];
      });
    }

    ctx.eventTarget.addEventListener("bilibiliMessage", onDanmuMessage);

    return () =>
      ctx.eventTarget.removeEventListener("bilibiliMessage", onDanmuMessage);
  }, [ctx.eventTarget]);
  // endregion

  // region scroll
  const [listRef, setListRef] = useState<HTMLDivElement | null>(null);
  const listScroll: MotionValue<number> = useSpring(0, {
    stiffness: 120,
    damping: 20,
  });

  const prevElement = useRef<HTMLDivElement>();
  const prevScrollHeight = useRef(0);
  const prevHover = useRef(false);
  const [latestElement, setLatestElement] = useState<HTMLDivElement | null>(
    null
  );
  useLayoutEffect(() => {
    if (!latestElement || !listRef) return;
    if (prevElement.current) {
      const offsetBottom = latestElement.offsetTop + latestElement.offsetHeight;
      const prevOffsetBottom =
        prevElement.current.offsetTop + prevElement.current.offsetHeight;
      const heightAppended = offsetBottom - prevOffsetBottom;

      const isMaxSizeReached =
        listRef.scrollHeight === prevScrollHeight.current &&
        listRef.scrollHeight !== listRef.clientHeight;

      const isHoverChanged = prevHover.current !== hover;

      if (!hover && !isHoverChanged) {
        listScroll.jump(listScroll.get() + heightAppended);
        listScroll.set(0);
      } else {
        const currentScrollBottom = maxScrollTop(listRef) - listRef.scrollTop;

        if (isMaxSizeReached) {
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
    prevScrollHeight.current = listRef.scrollHeight;
    prevElement.current = latestElement;
  }, [hover, latestElement, listRef, listScroll]);

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
        const prev = idx < arr.length - 1 ? arr[idx + 1] : undefined;
        const next = idx > 0 ? arr[idx - 1] : undefined;
        return (
          <DanmuItemContainer
            key={item.uuid}
            ref={idx === arr.length - 1 ? setLatestElement : undefined}
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

  & > * {
    outline: gray solid 2px;
  }
`;

const DanmuItemContainer = styled(motion.div)`
  position: relative;
`;
