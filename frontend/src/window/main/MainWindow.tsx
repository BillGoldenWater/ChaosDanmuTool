/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from "react";
import { Background } from "../../share/component/Background";
import { DanmuView } from "./DanmuView";

export function MainWindow() {
  return (
    <Background>
      <DanmuView />
    </Background>
  );
}
