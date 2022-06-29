/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { ReactNode } from "react";
import { Content } from "../../../../../rendererShare/component/content/Content";
import { ConnectionManager } from "./ConnectionManager";
import { ConnectionSettings } from "./ConnectionSettings";
import { Spacer } from "../../../../../rendererShare/component/spacer/Spacer";

export class ConnectRoom extends React.Component {
  render(): ReactNode {
    return (
      <Content>
        <ConnectionManager />
        <Spacer vertical />
        <Spacer vertical />
        <ConnectionSettings />
      </Content>
    );
  }
}