/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import styled from "styled-components";

export interface SpacerProps {
  vertical?: boolean;

  size: string;
}

export const Spacer = styled.div<SpacerProps>`
  display: flex;

  ${(p) => (p.vertical ? `height: ${p.size}` : `width: ${p.size}`)}
`;
