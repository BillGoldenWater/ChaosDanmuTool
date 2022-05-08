/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { ReactNode } from "react";
import { Content } from "../../../../../rendererShare/component/content/Content";
import { ConnectionManager } from "./ConnectionManager";

export class ConnectRoom extends React.Component {
  render(): ReactNode {
    return (
      <Content>
        <ConnectionManager />
      </Content>
    );
  }
}
