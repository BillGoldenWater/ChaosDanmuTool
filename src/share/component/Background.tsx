/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { PropsWithChildren, useContext } from "react";
import { themeCtx } from "./ThemeCtx";

export function Background({ children }: PropsWithChildren) {
  const theme = useContext(themeCtx);

  return (
    <div
      css={`
        width: 100vw;
        height: 100vh;
        background-color: ${theme.consts.background};
        color: ${theme.consts.text};
      `}
    >
      {children}
    </div>
  );
}
