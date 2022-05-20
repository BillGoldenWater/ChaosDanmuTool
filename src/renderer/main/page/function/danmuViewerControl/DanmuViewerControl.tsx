/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { ReactNode } from "react";
import { Content } from "../../../../../rendererShare/component/content/Content";
import { DanmuViewerManager } from "./DanmuViewerManager";
import { DanmuViewerSettings } from "./DanmuViewerSettings";
import { Spacer } from "../../../../../rendererShare/component/spacer/Spacer";

export class DanmuViewerControl extends React.Component {
  render(): ReactNode {
    return (
      <Content>
        <DanmuViewerManager />
        <Spacer vertical />
        <Spacer vertical />
        <Spacer vertical />
        <DanmuViewerSettings />
      </Content>
    );
  }
}
