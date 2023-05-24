/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import styled from "styled-components";
import { ConnectPanel } from "./ConnectPanel";
import React, { useMemo } from "react";
import { MotionPanel } from "../../share/component/Panel";
import { AnimatePresence, motion } from "framer-motion";
import { useAppCtx } from "../../share/app/AppCtx";
import { DanmuViewer } from "../../share/component/DanmuViewer";
import { DisconnectPanel } from "./DisconnectPanel";
import { paddingValue } from "../../share/component/ThemeCtx";

export function DanmuView() {
  const ctx = useAppCtx();

  const connected = ctx.receiverStatus === "connected";

  const content = useMemo(() => {
    if (connected) {
      // region animation
      const container = {
        init: {},
        show: {
          transition: {
            type: "spring",
            damping: 35,
            stiffness: 800,
            staggerChildren: 0.05,
          },
        },
        exit: {
          transition: {
            type: "spring",
            damping: 35,
            stiffness: 1200,
            staggerChildren: 0.1,
            staggerDirection: -1,
          },
        },
      };

      const item = {
        init: {
          ...container.init,
          scale: 0.8,
          opacity: 0,
        },
        show: {
          ...container.show,
          scale: 1,
          opacity: 1,
        },
        exit: {
          ...container.init,
          scale: 0.8,
          opacity: 0,
        },
      };
      // endregion

      return (
        <ContentContainer
          key={"danmuViewer"}
          variants={container}
          initial={"init"}
          animate={"show"}
          exit={"exit"}
        >
          <motion.div variants={item}>
            <DisconnectPanel />
          </motion.div>
          <ViewerContainer variants={item}>
            <DanmuViewer />
          </ViewerContainer>
        </ContentContainer>
      );
    } else {
      const container = {
        hidden: {
          translateY: "-25%",
          opacity: 0,
          transition: {
            type: "spring",
            damping: 50,
            stiffness: 1200,
          },
        },
        show: {
          translateY: "0",
          opacity: 1,
          transition: {
            type: "spring",
            damping: 35,
            stiffness: 800,
          },
        },
      };

      return (
        <ContentContainer
          key={"connectPanel"}
          variants={container}
          initial={"hidden"}
          animate={"show"}
          exit={"hidden"}
        >
          <ConnectPanel />
        </ContentContainer>
      );
    }
  }, [connected]);

  return (
    <DanmuViewContainer>
      <AnimatePresence mode={"popLayout"} initial={false}>
        {content}
      </AnimatePresence>
    </DanmuViewContainer>
  );
}

const DanmuViewContainer = styled.div`
  height: 100%;
`;

const ViewerContainer = styled(MotionPanel)`
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
