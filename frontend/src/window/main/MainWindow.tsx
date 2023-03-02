/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { LayoutGroup, motion } from "framer-motion";
import React from "react";
import { Background } from "../../share/component/Background";
import { ConnectPanel } from "./ConnectPanel";
import { paddingValue } from "../../share/component/ThemeCtx";
import { DanmuViewer } from "../../share/component/DanmuViewer";
import styled from "styled-components";
import { Panel } from "../../share/component/Panel";

export function MainWindow() {
  return (
    <MainWindowBackground>
      <LayoutGroup>
        <ConnectPanel />
        <ViewerContainer layout={"preserve-aspect"}>
          <DanmuViewer />
        </ViewerContainer>
        <motion.div layout whileHover={{ padding: paddingValue.normal }}>
          Toolbar
        </motion.div>
      </LayoutGroup>
    </MainWindowBackground>
  );
}

const MainWindowBackground = styled(Background)`
  display: grid;
  grid-template-rows: max-content auto max-content;

  gap: ${paddingValue.window};
`;

const ViewerContainer = styled(Panel)`
  overflow-y: hidden;
`;

ViewerContainer.defaultProps = { height: "100%", hover: true };
