/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import styled, { css } from "styled-components";
import { Property } from "csstype";
import { color, padding, radius, shadow } from "./ThemeCtx";

export interface PanelProps {
  $width?: Property.Width;
  $height?: Property.Height;
  $hover?: boolean;
  $noLayout?: boolean;
}

const panelFlex = css`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10rem;

  ${padding.normal}
`;

export const Panel = styled.div<PanelProps>`
  ${(p) => (p.$noLayout ? "" : panelFlex)}

  ${radius.normal}

  ${(p) => (p.$hover ? shadow.content : shadow.contentHover)}

  width: ${(p) => p.$width || "100%"};
  height: ${(p) => p.$height || "fit-content"};

  background-color: ${color.bgContent};
`;
