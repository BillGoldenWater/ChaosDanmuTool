/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import styled from "styled-components";
import { padding } from "./ThemeCtx";
import { motion } from "framer-motion";

export const Background = styled(motion.div)`
  ${padding.window};

  width: 100vw;
  height: 100vh;
  background-color: ${(p) => p.theme.consts.bgWindow};
  color: ${(p) => p.theme.consts.txt};
`;
