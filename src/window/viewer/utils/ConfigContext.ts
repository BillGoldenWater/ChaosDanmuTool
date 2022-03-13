/*
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from "react";
import { getDefaultDanmuViewCustomConfig } from "../../../utils/config/Config";

export const ConfigContext = React.createContext({
  config: getDefaultDanmuViewCustomConfig(),
  giftConfig: undefined,
});
