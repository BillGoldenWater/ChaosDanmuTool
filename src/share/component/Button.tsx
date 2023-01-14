/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import styled, { css } from "styled-components";
import { InputBase } from "./InputBase";
import { buttonTransition } from "./ButtonTransition";

export interface ButtonProps {
  primary?: boolean;
}

export const Button = styled(InputBase.withComponent("button"))<ButtonProps>`
  ${buttonTransition};

  color: ${(p) =>
    p.disabled ? p.theme.consts.secondaryText : p.theme.consts.text};

  ${(p) => {
    let color = "transparent";
    if (p.primary) {
      if (p.disabled) {
        color = p.theme.consts.raw.buttonPrimaryBackground
          .desaturate(0.8)
          .string();
      } else {
        color = p.theme.consts.buttonPrimaryBackground;
      }
    }
    return `background-color: ${color}`;
  }};

  ${(p) => {
    if (!p.disabled) {
      let hoverBackground = p.theme.consts.raw.buttonPrimaryBackground
        .lighten(0.2)
        .string();
      let activeBackground = p.theme.consts.raw.buttonPrimaryBackground
        .darken(0.1)
        .string();

      if (!p.primary) {
        hoverBackground = p.theme.consts.buttonBackground;
        activeBackground = p.theme.consts.raw.buttonBackground
          .darken(0.2)
          .string();
      }

      return css`
        &:hover {
          background-color: ${hoverBackground};
        }

        &:active {
          background-color: ${activeBackground};
        }
      `;
    }
  }}
`;
