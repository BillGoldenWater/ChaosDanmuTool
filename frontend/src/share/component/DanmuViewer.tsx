/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import styled from "styled-components";
import { padding, paddingValue } from "./ThemeCtx";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
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
import Immutable from "immutable";
import { useHoverState } from "../hook/useHoverState";

export function DanmuViewer() {
  const scrollAnimation = true;

  const [hover, setHover] = useHoverState();
  const msgList = useMsgList();
  const [setListRef, setLatestElement] = useAutoScroll(
    msgList.size === DanmuViewerMaxSize,
    hover,
    scrollAnimation
  );

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

function useMsgList() {
  const ctx = useContext(appCtx);

  const [[msgList, msgListBuf], setMsgList] = useState<
    [Immutable.List<CommandPacket>, Immutable.List<CommandPacket>]
  >(() => [Immutable.List(), Immutable.List()]);

  useEffect(() => {
    function onBiliBiliMessage(event: BiliBiliMessageEvent) {
      setMsgList(([list, buf]) => {
        if (
          document.visibilityState !== "visible" &&
          buf.size > DanmuViewerMaxSize
        ) {
          return [
            list,
            buf
              .push(event.message)
              .slice(Math.max(buf.size - DanmuViewerMaxSize, 0), buf.size),
          ];
        } else {
          return [list, buf.push(event.message)];
        }
      });
    }

    ctx.eventTarget.addEventListener("bilibiliMessage", onBiliBiliMessage);

    return () =>
      ctx.eventTarget.removeEventListener("bilibiliMessage", onBiliBiliMessage);
  }, [ctx.eventTarget]);

  const processBuf = useCallback(() => {
    setMsgList((prev) => {
      if (document.visibilityState !== "visible") {
        return prev;
      }

      const [list, buf] = prev;

      const newList = list.merge(buf);
      return [
        newList.slice(
          Math.max(newList.size - DanmuViewerMaxSize, 0),
          newList.size
        ),
        buf.clear(),
      ];
    });
  }, []);

  const bufUpdateIdRef = useRef<number | null>(null);
  useEffect(() => {
    if (
      msgListBuf.size === 0 ||
      bufUpdateIdRef.current != null ||
      document.visibilityState !== "visible"
    )
      return;

    bufUpdateIdRef.current = window.setTimeout(() => {
      processBuf();
      bufUpdateIdRef.current = null;
    }, 50);
  }, [msgListBuf.size, processBuf]);

  useEffect(() => {
    function onVisibilityChange() {
      if (document.visibilityState === "visible") processBuf();
    }

    document.addEventListener("visibilitychange", onVisibilityChange);

    return () =>
      document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [processBuf]);

  return msgList;
}

function useAutoScroll(
  msgListReachedMaxSize: boolean,
  hover: boolean,
  animation: boolean
): [
  Dispatch<SetStateAction<HTMLDivElement | null>>,
  Dispatch<SetStateAction<HTMLDivElement | null>>
] {
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
  useEffect(() => {
    if (!latestElement || !listRef) return;
    const isHoverChanged = prevHover.current !== hover;

    function scrollTo(value: number) {
      if (!listRef) return;

      listRef.scrollTo({
        top: maxScrollTop(listRef) - value,
      });
    }

    function scroll(jump?: number, set?: number) {
      if (animation) {
        if (jump != null) listScroll.jump(jump);
        if (set != null) listScroll.set(set);
      } else {
        if (jump != null && set != null) scrollTo(set);
        else if (jump != null) scrollTo(jump);
        else if (set != null) scrollTo(set);
      }
    }

    if (prevElement.current) {
      const offsetBottom = latestElement.offsetTop + latestElement.offsetHeight;
      const prevOffsetBottom =
        prevElement.current.offsetTop + prevElement.current.offsetHeight;
      const heightAppended = offsetBottom - prevOffsetBottom;

      if (!hover && !isHoverChanged) {
        scroll(listScroll.get() + heightAppended, 0);
      } else {
        const currentScrollBottom = maxScrollTop(listRef) - listRef.scrollTop;

        if (msgListReachedMaxSize) {
          const newScrollBottom = Math.min(
            currentScrollBottom + heightAppended,
            listRef.scrollHeight
          );

          scroll(newScrollBottom);
        } else {
          scroll(currentScrollBottom);
        }

        if (isHoverChanged && !hover) {
          scroll(undefined, 0);
        }
      }
    }

    prevHover.current = hover;
    prevElement.current = latestElement;
  }, [
    animation,
    hover,
    latestElement,
    listRef,
    listScroll,
    msgListReachedMaxSize,
  ]);

  useEffect(() => {
    if (!listRef) return;
    return listScroll.on("change", (value) => {
      listRef.scrollTo({
        top: maxScrollTop(listRef) - value,
      });
    });
  }, [listRef, listScroll]);

  return [setListRef, setLatestElement];
}
