/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import styled from "styled-components";
import { ConnectPanel } from "./ConnectPanel";
import React, { useContext, useMemo } from "react";
import { Panel } from "../../share/component/Panel";
import { AnimatePresence, motion } from "framer-motion";
import { appCtx } from "../../share/app/AppCtx";
import { DanmuViewer } from "../../share/component/DanmuViewer";
import { DisconnectPanel } from "./DisconnectPanel";
import { paddingValue } from "../../share/component/ThemeCtx";

export function DanmuView() {
  const ctx = useContext(appCtx);

  const connected =
    ctx.receiverStatus === "connected" || ctx.receiverStatus === "reconnecting";

  const content = useMemo(() => {
    if (connected) {
      return (
        <>
          <DisconnectPanel />
          <ViewerContainer>
            <DanmuViewer />
          </ViewerContainer>
        </>
      );
    } else {
      return <ConnectPanel />;
    }
  }, [connected]);

  return (
    <DanmuViewContainer>
      <AnimatePresence mode={"popLayout"} initial={false}>
        <ContentContainer
          key={connected ? "danmuViewer" : "connectPanel"}
          initial={{ translateY: "-25%", opacity: 0 }}
          animate={{ translateY: "0", opacity: 1 }}
          exit={{ translateY: "25%", opacity: 0 }}
          onAnimationStart={() => console.log("1")}
          transition={{
            type: "spring",
            damping: 35,
            stiffness: 800,
          }}
        >
          {content}
        </ContentContainer>
      </AnimatePresence>
    </DanmuViewContainer>
  );
}

const DanmuViewContainer = styled.div`
  height: 100%;
`;

const ViewerContainer = styled(Panel)`
  flex-grow: 1;
  overflow-y: hidden;
`;

ViewerContainer.defaultProps = { $height: "100%", $hover: true };

const ContentContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: ${paddingValue.window};

  height: 100%;
`;
