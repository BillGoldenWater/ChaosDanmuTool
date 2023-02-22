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
import { useContext } from "react";
import { motion } from "framer-motion";
import { appCtx } from "../../share/app/AppCtx";
import { UilLinkBroken } from "@iconscout/react-unicons";
import { backend } from "../../share/app/BackendApi";

interface ConnectStateProps {
  connected?: boolean;
}

export function ConnectPanel() {
  const ctx = useContext(appCtx);

  const connected =
    ctx.receiverStatus === "connected" || ctx.receiverStatus === "reconnecting";
  const connecting = ctx.receiverStatus === "connecting";

  return (
    <ConnectPanelBase layout layoutRoot connected={connected}>
      <InnerPanel
        {...(connected
          ? {}
          : { height: "25rem", width: "28.125rem", hover: true })}
        connected={connected}
        layout
      >
        <motion.input layout={"position"} defaultValue={953650} />
        <ConnectBtn
          layout
          connected={connected}
          onClick={() => {
            if (connected) {
              backend?.disconnectRoom();
            } else {
              backend?.connectRoom();
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

// region connect button
const btnUnconnected = css`
  width: 9.375rem;
  height: 9.375rem;

  color: ${color.theme};

  font-size: 2.5rem;
  font-weight: 400;
`;
const btnConnected = css`
  display: inline-flex;
  padding: 0;

  color: ${color.fnErr};

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
      style={{
        position: "absolute",
        left: 0,
        top: 0,
      }}
    >
      <defs>
        <circle id={"circle"} r={"50%"} cx={"50%"} cy={"50%"} />

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
        strokeDasharray={`${Math.PI * 100}%`}
      >
        {connecting ? (
          <animate
            attributeName={"stroke-dashoffset"}
            values={`0;${Math.PI * 200}%`}
            dur={"1.25s"}
            repeatCount={"indefinite"}
          />
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
  height: calc(100vh - calc(2 * ${paddingValue.window}));
  width: calc(100vw - calc(2 * ${paddingValue.window}));
`;

const connected = css`
  height: fit-content;
  width: 100%;
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
const panelConnected = css`
  ${padding.normal}

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
