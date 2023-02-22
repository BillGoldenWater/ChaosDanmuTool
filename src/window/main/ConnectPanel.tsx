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
  radius,
} from "../../share/component/ThemeCtx";
import { Panel } from "../../share/component/Panel";
import { useContext, useState } from "react";
import { motion } from "framer-motion";
import { appCtx } from "../../share/app/AppCtx";

interface ConnectStateProps {
  connected?: boolean;
}

export function ConnectPanel() {
  const ctx = useContext(appCtx);

  const [connected, setConnected] = useState(false);

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
              setConnected(!connected);
            } else {
              // setConnected(!connected);
              setTimeout(setConnected.bind(null, true), 500);
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
          {connected ? "D" : "连接"}
        </ConnectBtn>
      </InnerPanel>
    </ConnectPanelBase>
  );
}

// region connect button
const btnUnconnected = css`
  width: 9.375rem;
  height: 9.375rem;

  border-radius: 50%;
  border-color: ${color.theme};

  color: ${color.theme};

  font-size: 2.5rem;
  font-weight: 400;
`;
const btnConnected = css`
  padding: 0.3125rem 0.75rem;

  ${radius.normal}
  border-color: ${color.fnErr};

  color: ${color.fnErr};

  ${font.input}
`;

const ConnectBtn = styled(motion.button)<ConnectStateProps>`
  background-color: transparent;

  ${(p) => (p.connected ? btnConnected : btnUnconnected)}

  border-style: solid;
  border-width: 0.125rem;

  user-select: none;
`;
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
  display: block flex;

  ${(p) => (p.connected ? panelConnected : panelUnconnected)};
`;
InnerPanel.defaultProps = { noLayout: true };
// endregion
