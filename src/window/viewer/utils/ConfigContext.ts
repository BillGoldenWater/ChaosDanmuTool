import React from "react";
import { getDefaultDanmuViewCustomConfig } from "../../../utils/config/Config";

export const ConfigContext = React.createContext({
  config: { ...getDefaultDanmuViewCustomConfig() },
  giftConfig: undefined,
});
