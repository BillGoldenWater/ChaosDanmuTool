/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { css } from "styled-components";

export const buttonTransition = css<{ disabled?: boolean }>`
  transition: background-color ease-out 0.1s,
    transform cubic-bezier(0.1, 0, 0.5, 2) 0.1s;

  cursor: ${(p) => (p.disabled ? "not-allowed" : "pointer")};

  ${(p) => {
    if (!p.disabled) {
      return css`
        &:hover {
          transform: scale(1.025);
        }

        &:active {
          transform: scale(0.95);
        }
      `;
    }
  }}
`;
