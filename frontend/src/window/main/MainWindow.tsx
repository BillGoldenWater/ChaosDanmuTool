/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { LayoutGroup, motion } from "framer-motion";
import React from "react";
import { Background } from "../../share/component/Background";
import { ConnectPanel } from "./ConnectPanel";
import { paddingValue } from "../../share/component/ThemeCtx";

export function MainWindow() {
  return (
    <Background
      css={`
        display: flex;
        flex-direction: column;

        gap: ${paddingValue.window};
      `}
    >
      <LayoutGroup>
        <ConnectPanel />
        <motion.div
          layout={"preserve-aspect"}
          css={`
            display: flex;
            background-color: gray;
            flex-direction: column-reverse;
            flex-grow: 1;
          `}
        >
          123
        </motion.div>
        <motion.div
          layout
          css={`
            background-color: gray;
          `}
          whileHover={{ padding: paddingValue.normal }}
        >
          Toolbar
        </motion.div>
      </LayoutGroup>
    </Background>
  );
}
