/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import styled, { css } from "styled-components";
import { InputBase } from "../InputBase";

export const TextInput = styled(InputBase)`
  ${({ theme: { consts }, disabled }) => {
    let textColor = consts.text;
    let backgroundColor = consts.inputBackground;
    const focusBackgroundColor = consts.raw.inputBackground
      .opaquer(0.5)
      .string();

    if (disabled) {
      textColor = consts.secondaryText;
      backgroundColor = consts.raw.inputBackground.darken(0.2).string();
    }

    let focusCss = css``;
    if (!disabled) {
      focusCss = css`
        &:hover,
        &:focus {
          background-color: ${focusBackgroundColor};
          transform: scale(1.025);
        }
      `;
    }

    return css`
      transition: background-color ease-out 0.1s,
        transform cubic-bezier(0.1, 0, 0.5, 2) 0.1s;

      color: ${textColor};

      background-color: ${backgroundColor};

      ${disabled ? "user-select: none;" : ""}
      ${disabled ? "cursor: not-allowed;" : ""}

      ${focusCss}
    `;
  }}
`;
