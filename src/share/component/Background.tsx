/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import styled from "styled-components";
import { padding, paddingValue } from "./ThemeCtx";
import { motion } from "framer-motion";

export const Background = styled(motion.div)`
  ${padding.window};

  width: calc(100% - ${paddingValue.window} * 2);
  height: calc(100% - ${paddingValue.window} * 2);
  background-color: ${(p) => p.theme.consts.bgWindow};
  color: ${(p) => p.theme.consts.txt};
`;
