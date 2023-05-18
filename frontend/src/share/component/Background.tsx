/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import styled from "styled-components";
import { padding } from "./ThemeCtx";

export const Background = styled.div`
  ${padding.window};

  height: 100%;
  background-color: ${(p) => p.theme.consts.bgWindow};
  color: ${(p) => p.theme.consts.txt};
`;
