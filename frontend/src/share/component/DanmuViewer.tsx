/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import styled from "styled-components";
import { padding } from "./ThemeCtx";
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
import { CommandPacket } from "../type/rust/command_packet";
import { DanmuItem, TDanmuItemInfo } from "./danmuItem/DanmuItem";
import { motion, MotionValue, useSpring } from "framer-motion";
import { maxScrollTop } from "../utils/ElementUtils";
import {
  DanmuViewerMaxSize,
  GiftMergeIntervalInSeconds,
} from "../app/Settings";
import Immutable from "immutable";
import { useHoverState } from "../hook/useHoverState";

export function DanmuViewer() {
  const scrollAnimation = true;

  const [hover, setHover] = useHoverState();
  const msgList = useMsgList(hover);
  const { dmList } = useMsgPreProcess(msgList);
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
      {dmList.map((info, idx, arr) => {
        return (
          <DanmuItemContainer
            key={info.item.uuid}
            ref={idx === arr.size - 1 ? setLatestElement : undefined}
          >
            <DanmuItem info={info} />
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
`;

const DanmuItemContainer = styled(motion.div)`
  position: relative;
`;

function useMsgList(hover: boolean) {
  const ctx = useContext(appCtx);

  const [visible, setVisible] = useState(
    document.visibilityState === "visible"
  );
  const shouldProcessBuf = !hover && visible;

  const [[msgList, msgListBuf], setMsgList] = useState<
    [Immutable.List<CommandPacket>, Immutable.List<CommandPacket>]
  >(() => [Immutable.List(), Immutable.List()]);

  useEffect(() => {
    function onBiliBiliMessage(event: BiliBiliMessageEvent) {
      setMsgList(([list, buf]) => {
        if (!shouldProcessBuf && buf.size > DanmuViewerMaxSize) {
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
  }, [ctx.eventTarget, shouldProcessBuf]);

  const processBuf = useCallback(() => {
    setMsgList((prev) => {
      if (!shouldProcessBuf) {
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
  }, [shouldProcessBuf]);

  const bufUpdateIdRef = useRef<number | null>(null);
  useEffect(() => {
    if (
      msgListBuf.size === 0 ||
      bufUpdateIdRef.current != null ||
      !shouldProcessBuf
    )
      return;

    bufUpdateIdRef.current = window.setTimeout(() => {
      processBuf();
      bufUpdateIdRef.current = null;
    }, 50);
  }, [msgListBuf.size, processBuf, shouldProcessBuf]);

  useEffect(() => {
    function onVisibilityChange() {
      if (document.visibilityState === "visible") {
        setVisible(true);
        processBuf();
      } else {
        setVisible(false);
      }
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

    function scrollTo(value: number) {
      if (!listRef) return;

      listRef.scrollTo({
        top: maxScrollTop(listRef) - value,
      });
    }

    function scroll(jump: number, set?: number) {
      if (animation) {
        listScroll.jump(jump);
        if (set != null) listScroll.set(set);
      } else {
        if (set != null) scrollTo(set);
      }
    }

    if (prevElement.current) {
      const offsetBottom = latestElement.offsetTop + latestElement.offsetHeight;
      const prevOffsetBottom =
        prevElement.current.offsetTop + prevElement.current.offsetHeight;
      const heightAppended = offsetBottom - prevOffsetBottom;

      if (!hover) {
        if (prevHover.current) {
          scroll(maxScrollTop(listRef) - listRef.scrollTop, 0);
        } else {
          scroll(listScroll.get() + heightAppended, 0);
        }
      } else {
        scroll(maxScrollTop(listRef) - listRef.scrollTop);
      }
    }

    prevHover.current = hover;
    prevElement.current = latestElement;
  }, [animation, hover, latestElement, listRef, listScroll]);

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

function useMsgPreProcess(msgList: Immutable.List<CommandPacket>): {
  dmList: Immutable.List<TDanmuItemInfo>;
  activity: number;
} {
  const [dmList, setDmList] = useState(Immutable.List<TDanmuItemInfo>);
  const [activity, setActivity] = useState(0);

  useEffect(() => {
    const list: TPreProcessMsgItem[] = [];

    // region count gift, check color and process command
    const giftCounter = new Map<
      string,
      { ts: number; prev: TPreProcessMsgItem }
    >();

    interface TPreProcessMsgItem {
      info: TDanmuItemInfo | null;
      uid: string;
      hasColor: boolean;
    }

    msgList.forEach((it) => {
      if (it.cmd !== "biliBiliCommand") return;

      switch (it.data.cmd) {
        case "danmuMessage": {
          const dmMsg = it.data.data;
          const dmInfo = {
            item: it,
            mergeNext: false,
            mergePrev: false,
            giftNumSum: 0,
          };

          list.push({
            info: dmInfo,
            uid: dmMsg.uid,
            hasColor: dmMsg.bubbleColor !== "",
          });
          break;
        }
        case "giftMessage": {
          const giftMsg = it.data.data;
          const dmInfo = {
            item: it,
            mergeNext: false,
            mergePrev: false,
            giftNumSum: giftMsg.num,
          };
          const item: TPreProcessMsgItem = {
            info: dmInfo,
            uid: giftMsg.uid,
            hasColor: giftMsg.coinType === "gold",
          };

          const giftIdentifier = `${giftMsg.uid}:${giftMsg.giftId}`;
          const ts = Number.parseInt(giftMsg.timestamp);

          const prevGift = giftCounter.get(giftIdentifier);
          if (prevGift) {
            if (prevGift.ts > ts - GiftMergeIntervalInSeconds) {
              // in the interval
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              prevGift.prev.info!.giftNumSum += dmInfo.giftNumSum;
              item.info = null;
            }
            prevGift.ts = ts;
          } else {
            giftCounter.set(giftIdentifier, { ts, prev: item });
          }

          list.push(item);
          break;
        }
        case "activityUpdate": {
          const activity = it.data.data.activity;
          setActivity((prev) => (prev !== activity ? activity : prev));
          break;
        }
        case "raw": {
          list.push({
            info: {
              item: it,
              mergeNext: false,
              mergePrev: false,
              giftNumSum: 0,
            },
            uid: "",
            hasColor: false,
          });
          break;
        }
      }
    });
    // endregion

    // region apply merge and unwrap
    const dmList = list
      .filter((it) => it.info != null)
      .map((item, idx, arr) => {
        if (idx > 0) {
          const prevItem = arr[idx - 1];
          if (prevItem.hasColor === item.hasColor && prevItem.uid == item.uid) {
            if (prevItem.info) prevItem.info.mergeNext = true;
            if (item.info) item.info.mergePrev = true;
          }
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          return item.info!;
        } else {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          return item.info!;
        }
      });
    // endregion

    setDmList((prevList) => {
      const immutableList = Immutable.List(dmList);
      if (immutableList.equals(prevList)) {
        return prevList;
      } else {
        return immutableList;
      }
    });
  }, [msgList]);

  return { dmList, activity };
}
