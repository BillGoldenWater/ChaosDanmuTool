/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Property } from "csstype";
import styled from "styled-components";
import { borderValue, font, radius } from "../ThemeCtx";

interface UserInfoIconProps {
  text: string;
  color: Property.Color;
}

export function UserInfoIcon({ color, text }: UserInfoIconProps) {
  return <UserInfoIconBase $bgColor={color}>{text}</UserInfoIconBase>;
}

const UserInfoIconBase = styled.div<{ $bgColor: Property.Color }>`
  display: inline-flex;
  align-items: center;

  padding: calc(${borderValue.normal} + ${borderValue.small});

  ${radius.small};

  background-color: ${(p) => p.$bgColor};

  ${font.userName}
`;
