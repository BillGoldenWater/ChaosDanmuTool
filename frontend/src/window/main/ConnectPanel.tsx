/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import styled, { css } from "styled-components";
import {
  color,
  font,
  padding,
  paddingValue,
  themeCtx,
} from "../../share/component/ThemeCtx";
import { Panel } from "../../share/component/Panel";
import { useCallback, useContext, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { appCtx } from "../../share/app/AppCtx";
import { UilLinkBroken } from "@iconscout/react-unicons";
import { backend } from "../../share/app/BackendApi";
import { NumberInput } from "../../share/component/input/NumberInput";

interface ConnectStateProps {
  connected?: boolean;
  connectedHover?: boolean;
}

const defaultInnerPanelSize = { height: "25rem", width: "28.125rem" };

export function ConnectPanel() {
  const ctx = useContext(appCtx);

  const [hover, setHover] = useState(false);

  const connected =
    ctx.receiverStatus === "connected" || ctx.receiverStatus === "reconnecting";
  const connecting = ctx.receiverStatus === "connecting";

  return (
    <ConnectPanelBase layout connected={connected}>
      <InnerPanel
        {...(connected ? {} : defaultInnerPanelSize)}
        layout
        hover={!connected}
        connectedHover={hover}
        connected={connected}
        onHoverStart={setHover.bind(null, true)}
        onHoverEnd={setHover.bind(null, false)}
      >
        <RoomidInput connected={connected} hover={hover} />
        <ConnectBtn
          layout={"position"}
          connected={connected}
          connectedHover={hover}
          onClick={() => {
            if (connected || connecting) {
              backend?.disconnectRoom();
            } else {
              backend?.connectRoom();
              setHover(false);
            }
          }}
          whileHover={{
            scale: 1.05,
            transition: { type: "spring", damping: 20, stiffness: 500 },
          }}
          whileTap={{
            scale: 0.95,
            transition: { type: "spring", damping: 20, stiffness: 1000 },
          }}
        >
          {connected ? (
            <UilLinkBroken />
          ) : (
            <>
              <BtnConnectingSvg connecting={connecting} />
              连接
            </>
          )}
        </ConnectBtn>
      </InnerPanel>
    </ConnectPanelBase>
  );
}

// region roomid input
interface RoomidInputProps {
  connected: boolean;
  hover: boolean;
}

const RoomidInputBase = styled(NumberInput)<RoomidInputProps>`
  &:disabled {
    ${padding.small};

    color: ${(p) => (p.hover ? color.txt : color.txtSecond)} !important;
    -webkit-text-fill-color: ${(p) => (p.hover ? color.txt : color.txtSecond)};

    background-color: transparent;
    border-color: transparent;
  }
`;

function RoomidInput({ connected, ...props }: RoomidInputProps) {
  const ctx = useContext(appCtx);

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
    <RoomidInputBase
      {...props}
      layout
      connected={connected}
      value={roomid}
      onChange={onChange}
      placeholder={"房间号"}
      disabled={connected}
      autoWidth={connected}
    />
  );
}

// endregion

// region connect button
const btnUnconnected = css`
  width: 9.375rem;
  height: 9.375rem;

  color: ${color.theme};

  font-size: 2.5rem;
  font-weight: 400;
`;
const btnConnected = css<ConnectStateProps>`
  display: inline-flex;
  padding: 0;

  transition: color 0.2s ease-out;
  color: ${(p) => (p.connectedHover ? color.fnErr : color.txtSecond)};

  ${font.input}
`;

const ConnectBtn = styled(motion.button)<ConnectStateProps>`
  position: relative;
  background-color: transparent;

  ${(p) => (p.connected ? btnConnected : btnUnconnected)}

  border: 0;

  user-select: none;
`;

function BtnConnectingSvg({ connecting }: { connecting: boolean }) {
  const theme = useContext(themeCtx);

  return (
    <svg
      width={"100%"}
      height={"100%"}
      viewBox={"0 0 100 100"}
      style={{
        position: "absolute",
        left: 0,
        top: 0,
      }}
    >
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
        stroke={theme.consts.theme}
        strokeWidth={"calc(0.125rem * 2)"}
        strokeDasharray={`${Math.PI * 100}`}
      >
        {connecting ? (
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
    </svg>
  );
}

// endregion

// region panel base
const unconnected = css`
  --height: calc(100vh - ${paddingValue.window} * 2);
  height: var(--height);
  min-height: var(--height);
`;

const connected = css`
  height: fit-content;
`;

const ConnectPanelBase = styled(motion.div)<ConnectStateProps>`
  display: flex;
  justify-content: center;
  align-items: center;

  ${(p) => (p.connected ? connected : unconnected)}
`;
// endregion

// region inner panel
const panelUnconnected = css`
  flex-direction: column-reverse;
  justify-content: space-evenly;
  align-items: center;
`;
const panelConnected = css<ConnectStateProps>`
  ${(p) => (p.connectedHover ? padding.normal : padding.small)}

  flex-direction: row;
  align-items: center;

  gap: ${paddingValue.normal};
`;

const InnerPanel = styled(Panel)<ConnectStateProps>`
  display: flex;

  ${(p) => (p.connected ? panelConnected : panelUnconnected)};
`;
InnerPanel.defaultProps = { noLayout: true };
// endregion
