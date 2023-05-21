/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import styled from "styled-components";
import { color } from "../../share/component/ThemeCtx";
import { useHoverState } from "../../share/hook/useHoverState";
import { useMemo } from "react";
import { useAppCtx } from "../../share/app/AppCtx";
import { UilLinkBroken } from "@iconscout/react-unicons";
import { Panel } from "../../share/component/Panel";
import { backend } from "../../share/app/BackendApi";
import { motion } from "framer-motion";

export function DisconnectPanel() {
  const ctx = useAppCtx();
  const roomid = useMemo(
    () => ctx.config.get("backend.danmuReceiver.roomid"),
    [ctx.config]
  );

  const { hover, onEnter, onLeave } = useHoverState();

  return (
    <DisconnectPanelContainer onMouseEnter={onEnter} onMouseLeave={onLeave}>
      <Roomid $hover={hover}>{roomid}</Roomid>
      <DisconnectBtn
        $hover={hover}
        onClick={() => backend.disconnectRoom()}
        whileHover={{
          scale: 1.15,
          transition: { type: "spring", damping: 20, stiffness: 500 },
        }}
        whileTap={{
          scale: 0.95,
          transition: { type: "spring", damping: 30, stiffness: 1000 },
        }}
      >
        <UilLinkBroken />
      </DisconnectBtn>
    </DisconnectPanelContainer>
  );
}

const Roomid = styled.span<{ $hover: boolean }>`
  transition: color ease-in-out 0.15s;

  color: ${(p) => (p.$hover ? color.txt : color.txtSecond)};
`;

const DisconnectBtn = styled(motion.button)<{ $hover: boolean }>`
  transition: color ease-in-out 0.15s;

  display: flex;

  border: 0;

  background-color: transparent;
  color: ${(p) => (p.$hover ? color.fnErr : color.txtSecond)};
`;

const DisconnectPanelContainer = styled(Panel)`
  flex-direction: row;
  align-items: center;
`;
