/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import styled from "styled-components";
import { color, useThemeCtx } from "../../share/component/ThemeCtx";
import { Panel } from "../../share/component/Panel";
import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAppCtx } from "../../share/app/AppCtx";
import { backend } from "../../share/app/BackendApi";
import { NumberInput } from "../../share/component/input/NumberInput";
import { ReceiverStatus } from "../../share/type/rust/command_packet/app_command/receiver_status_update";

export function ConnectPanel() {
  const ctx = useAppCtx();

  async function onConnectBtnClick() {
    if (
      ctx.receiverStatus === "reconnecting" ||
      ctx.receiverStatus === "connecting"
    ) {
      await backend.disconnectRoom();
    } else if (ctx.receiverStatus === "close") {
      await backend.connectRoom();
    }
  }

  return (
    <ConnectPanelBase>
      <InnerPanel>
        <RoomidInput />
        <ConnectBtn
          onClick={onConnectBtnClick}
          whileHover={{
            scale: 1.05,
            transition: { type: "spring", damping: 20, stiffness: 500 },
          }}
          whileTap={{
            scale: 0.95,
            transition: { type: "spring", damping: 30, stiffness: 1000 },
          }}
        >
          <BtnConnectingSvg receiverStatus={ctx.receiverStatus} />
          连接
        </ConnectBtn>
      </InnerPanel>
    </ConnectPanelBase>
  );
}

// region roomid input
function RoomidInput() {
  const ctx = useAppCtx();

  const [roomid, setRoomid] = useState(() =>
    ctx.config.get("backend.danmuReceiver.roomid")
  );

  useEffect(() => {
    setRoomid(ctx.config.get("backend.danmuReceiver.roomid"));
  }, [ctx.config]);

  const onChange = useCallback(
    (value: number) => {
      ctx.config.set("backend.danmuReceiver.roomid", value);
      setRoomid(value);
    },
    [ctx.config]
  );

  return (
    <NumberInput value={roomid} onChange={onChange} placeholder={"房间号"} />
  );
}

// endregion

// region connect button

const ConnectBtn = styled(motion.button)`
  position: relative;
  background-color: transparent;

  width: 150rem;
  height: 150rem;

  border: 0;

  color: ${color.theme};

  font-size: 40rem;
  font-weight: 400;

  user-select: none;
`;

function BtnConnectingSvg({
  receiverStatus,
}: {
  receiverStatus: ReceiverStatus;
}) {
  const theme = useThemeCtx();

  const spinning =
    receiverStatus === "connecting" || receiverStatus === "reconnecting";
  let color = theme.consts.theme;
  switch (receiverStatus) {
    case "reconnecting": {
      color = theme.consts.fnWarn;
      break;
    }
    case "error": {
      color = theme.consts.fnErr;
      break;
    }
  }

  return (
    <BtnConnectSvgBase viewBox={"0 0 100 100"}>
      <defs>
        <circle id={"circle"} r={"50"} cx={"50"} cy={"50"} />

        <clipPath id={"innerStroke"}>
          <use xlinkHref={"#circle"} />
        </clipPath>
      </defs>

      <use
        xlinkHref={"#circle"}
        clipPath={"url(#innerStroke)"}
        fill={"transparent"}
        stroke={color}
        strokeWidth={"calc(2rem * 2)"}
        strokeDasharray={`${Math.PI * 100}`}
      >
        {spinning ? (
          <>
            <animate
              attributeName={"stroke-dashoffset"}
              values={`0; ${Math.PI * 200}`}
              dur={"2.5s"}
              repeatCount={"indefinite"}
            />
            <animateTransform
              attributeName={"transform"}
              type={"rotate"}
              values={"360 50 50; 0 50 50"}
              dur={"1s"}
              repeatCount={"indefinite"}
            />
          </>
        ) : (
          <></>
        )}
      </use>
    </BtnConnectSvgBase>
  );
}

const BtnConnectSvgBase = styled.svg`
  position: absolute;
  left: 0;
  top: 0;

  width: 100%;
  height: 100%;
`;

// endregion

// region panel base
const ConnectPanelBase = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  min-height: 100%;
`;
// endregion

// region inner panel
const InnerPanel = styled(Panel)`
  display: flex;
  height: 400rem;
  width: 450rem;

  flex-direction: column-reverse;
  justify-content: space-evenly;
  align-items: center;
`;
InnerPanel.defaultProps = { $noLayout: true, $hover: true };
// endregion
