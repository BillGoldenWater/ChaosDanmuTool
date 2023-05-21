/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import styled from "styled-components";
import { padding, paddingValue } from "./ThemeCtx";
import {
  createRef,
  Dispatch,
  ForwardedRef,
  forwardRef,
  memo,
  RefObject,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAppCtx } from "../app/AppCtx";
import { BiliBiliMessageEvent } from "../event/AppEventTarget";
import { CommandPacket } from "../type/rust/command_packet";
import { DanmuItem, TDanmuItemInfo } from "./danmuItem/DanmuItem";
import { AnimatePresence, MotionValue, useSpring } from "framer-motion";
import { maxScrollTop } from "../utils/ElementUtils";
import { DanmuViewerMaxSize } from "../app/Settings";
import Immutable from "immutable";
import { UilPlayCircle } from "@iconscout/react-unicons";
import { Button } from "./Button";
import { useKey } from "react-use";
import { useWindowVisible } from "../hook/useWindowVisible";

export function DanmuViewer() {
  const scrollAnimation = true;

  const [pause, setPause] = useState(false);
  const onPauseResume = useCallback(() => setPause((prev) => !prev), []);
  useKey(" ", onPauseResume);

  const { list: msgList } = useMsgState(pause);
  const dmList = useMsgPreProcess(msgList);

  const listRef = createRef<HTMLDivElement>();
  const setLatestElement = useAutoScroll(
    listRef,
    msgList.size === DanmuViewerMaxSize,
    pause,
    scrollAnimation
  );

  const dmItemList = useMemo(
    () =>
      dmList.map((info, idx, arr) => {
        return (
          <DanmuItemContainer
            key={info.item.uuid}
            ref={idx === arr.size - 1 ? setLatestElement : undefined}
            {...info}
          />
        );
      }),
    [dmList, setLatestElement]
  );

  return useMemo(() => {
    return (
      <DanmuViewerContainer>
        <DanmuViewerBase ref={listRef}>
          <div />
          {dmItemList}
        </DanmuViewerBase>
        <AnimatePresence>
          {pause && (
            <ResumeButton
              initial={{ opacity: 0, scale: 0.8, rotateZ: -180 }}
              animate={{ opacity: 1, scale: 1, rotateZ: 0 }}
              exit={{ opacity: 0, scale: 0.8, rotateZ: 90 }}
              transition={{
                type: "spring",
                damping: 30,
                stiffness: 400,
              }}
              onClick={setPause.bind(null, false)}
            >
              <UilPlayCircle />
            </ResumeButton>
          )}
        </AnimatePresence>
      </DanmuViewerContainer>
    );
  }, [dmItemList, listRef, pause]);
}

const DanmuViewerContainer = styled.div`
  position: relative;
  height: 100%;
  width: 100%;
`;

const DanmuViewerBase = styled.div`
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

const ResumeButton = styled(Button)`
  position: absolute;

  --spacing: ${paddingValue.normal};
  bottom: var(--spacing);
  right: var(--spacing);
`;
ResumeButton.defaultProps = { isIcon: true, primary: false };

const DanmuItemContainer = memo(forwardRef(DanmuItemContainerInner));

function DanmuItemContainerInner(
  danmuItem: TDanmuItemInfo,
  ref: ForwardedRef<HTMLDivElement>
) {
  return (
    <DanmuItemContainerBase ref={ref}>
      <DanmuItem info={danmuItem} />
    </DanmuItemContainerBase>
  );
}

const DanmuItemContainerBase = styled.div`
  position: relative;
`;

interface MsgState {
  list: Immutable.List<CommandPacket>;
  super_chat: Immutable.List<CommandPacket>;
  activity: number;
}

function useMsgState(pause: boolean): MsgState {
  const ctx = useAppCtx();

  const visible = useWindowVisible();
  const shouldSyncBuf = !pause && visible;

  // region process message
  const initialMsgStateBuf = useMemo<MsgState>(
    () => ({
      list: Immutable.List(),
      super_chat: Immutable.List(),
      activity: 0,
    }),
    []
  );
  const msgStateBufRef = useRef<MsgState>(initialMsgStateBuf);

  // region state
  const [msgState, setMsgState] = useState(initialMsgStateBuf);

  const syncBuf = useCallback(() => {
    if (shouldSyncBuf) setMsgState(msgStateBufRef.current);
  }, [shouldSyncBuf]);

  useEffect(() => (visible ? syncBuf() : undefined), [visible, syncBuf]);
  // endregion

  const processMsg = useCallback(
    (msg: CommandPacket) => {
      if (msg.cmd !== "biliBiliCommand") {
        console.error("unexpected non biliBiliCommand");
        console.error(msg);
        return;
      }

      // region handle msg
      const buf = msgStateBufRef.current;
      switch (msg.data.cmd) {
        case "danmuMessage": {
          buf.list = buf.list.push(msg);
          break;
        }
        case "giftMessage": {
          const giftMsg = msg.data.data;

          const prevTotal = buf.list.reduce((reduction, value) => {
            if (value.cmd !== "biliBiliCommand") return reduction;
            if (value.data.cmd !== "giftMessage") return reduction;
            if (value.data.data.uid !== giftMsg.uid) return reduction;
            if (value.data.data.giftId !== giftMsg.giftId) return reduction;
            return value.data.data.num + reduction;
          }, 0);

          let newList;

          if (prevTotal !== 0) {
            giftMsg.num += prevTotal;
            newList = buf.list
              .filterNot(
                (v) =>
                  v.cmd === "biliBiliCommand" &&
                  v.data.cmd === "giftMessage" &&
                  v.data.data.uid === giftMsg.uid &&
                  v.data.data.giftId === giftMsg.giftId
              )
              .push(msg);
          } else {
            newList = buf.list.push(msg);
          }

          buf.list = newList;
          break;
        }
        case "activityUpdate": {
          buf.activity = msg.data.data.activity;
          break;
        }
        case "raw":
        case "parseFailed": {
          return;
        }
      }
      // endregion

      // region handle size limit
      if (buf.list.size > DanmuViewerMaxSize) {
        buf.list = buf.list.slice(buf.list.size - DanmuViewerMaxSize);
      }
      // endregion

      msgStateBufRef.current = { ...buf };
      syncBuf();
    },
    [syncBuf]
  );

  useEffect(() => {
    function onBiliBiliMessage(event: BiliBiliMessageEvent) {
      processMsg(event.message);
    }

    ctx.eventTarget.addEventListener("bilibiliMessage", onBiliBiliMessage);

    return () =>
      ctx.eventTarget.removeEventListener("bilibiliMessage", onBiliBiliMessage);
  }, [ctx.eventTarget, processMsg]);
  // endregion

  return {
    list: msgState.list,
    super_chat: msgState.super_chat,
    activity: msgState.activity,
  };
}

function useAutoScroll(
  listRef: RefObject<HTMLDivElement>,
  msgListReachedMaxSize: boolean,
  pause: boolean,
  animation: boolean
): Dispatch<SetStateAction<HTMLDivElement | null>> {
  const listScroll: MotionValue<number> = useSpring(0, {
    stiffness: 120,
    damping: 20,
  });

  const prevElement = useRef<HTMLDivElement>();
  const prevPause = useRef(false);
  const [latestElement, setLatestElement] = useState<HTMLDivElement | null>(
    null
  );
  useEffect(() => {
    const list = listRef.current;

    if (!latestElement || !list) return;

    function scrollTo(value: number) {
      if (!list) return;

      list.scrollTo({
        top: maxScrollTop(list) - value,
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

      if (!pause) {
        if (prevPause.current) {
          scroll(maxScrollTop(list) - list.scrollTop, 0);
        } else {
          scroll(listScroll.get() + heightAppended, 0);
        }
      } else {
        scroll(maxScrollTop(list) - list.scrollTop);
      }
    }

    prevPause.current = pause;
    prevElement.current = latestElement;
  }, [animation, pause, latestElement, listRef, listScroll]);

  useEffect(() => {
    const list = listRef.current;

    if (!list) return;
    return listScroll.on("change", (value) => {
      list.scrollTo({
        top: maxScrollTop(list) - value,
      });
    });
  }, [listRef, listScroll]);

  return setLatestElement;
}

function useMsgPreProcess(
  msgList: Immutable.List<CommandPacket>
): Immutable.List<TDanmuItemInfo> {
  return useMemo(() => {
    interface PreProcessMsgItem {
      info: TDanmuItemInfo;
      uid: string;
      hasColor: boolean;
    }

    const defaultInfo: TDanmuItemInfo = {
      item: null as unknown as CommandPacket,
      mergePrev: false,
      mergeNext: false,
    };

    return msgList
      .map<null | PreProcessMsgItem>((item) => {
        if (item.cmd !== "biliBiliCommand") {
          return null;
        }

        switch (item.data.cmd) {
          case "danmuMessage": {
            const dmMsg = item.data.data;
            return {
              info: { ...defaultInfo, item },
              uid: dmMsg.uid,
              hasColor: dmMsg.bubbleColor !== "",
            };
          }
          case "giftMessage": {
            const giftMsg = item.data.data;
            return {
              info: { ...defaultInfo, item },
              uid: giftMsg.uid,
              hasColor: giftMsg.coinType === "gold",
            };
          }
          case "activityUpdate":
          case "raw":
          case "parseFailed": {
            return null;
          }
        }
      })
      .filter((it) => it != null)
      .map((item, idx, arr) => {
        const it = item as PreProcessMsgItem; // null safety: already filtered

        if (idx > 0) {
          const prevItem = arr.get(idx - 1) as PreProcessMsgItem;
          if (prevItem.hasColor === it.hasColor && prevItem.uid == it.uid) {
            if (prevItem.info) prevItem.info.mergeNext = true;
            if (it.info) it.info.mergePrev = true;
          }
          return it.info;
        } else {
          return it.info;
        }
      });
  }, [msgList]);
}
