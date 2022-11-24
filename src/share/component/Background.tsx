/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import styled from "styled-components";
import React, { PropsWithChildren } from "react";
import { ThemeCtxConsumer, TThemeCtx } from "./ThemeCtx";

export class Background extends React.Component<PropsWithChildren> {
  render() {
    return <ThemeCtxConsumer>{this.renderInner.bind(this)}</ThemeCtxConsumer>;
  }

  renderInner(theme: TThemeCtx) {
    let Background = styled.div`
      width: 100vw;
      height: 100vh;
      background-color: ${theme.colors[1].background};
      color: ${theme.colors[1].text};
    `;

    return <Background>{this.props.children}</Background>;
  }
}
