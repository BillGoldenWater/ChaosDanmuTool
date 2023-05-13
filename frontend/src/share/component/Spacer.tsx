/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import styled, { css } from "styled-components";
import { Property } from "csstype";

interface SpacerSizeProps {
  $size: Property.Width;
}

export interface SpacerProps extends SpacerSizeProps {
  $vertical?: boolean;
}

const vertical = css<SpacerSizeProps>`
  display: block;
  height: ${(p) => p.$size};
`;

const horizontal = css<SpacerSizeProps>`
  display: inline-block;
  width: ${(p) => p.$size};
`;

export const Spacer = styled.div<SpacerProps>`
  ${(p) => (p.$vertical ? vertical : horizontal)};
`;
