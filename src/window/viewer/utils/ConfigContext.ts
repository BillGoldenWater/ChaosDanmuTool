import React from "react";
import { defaultDanmuViewCustom } from "../../../utils/config/Config";

export const ConfigContext = React.createContext({
  config: { ...defaultDanmuViewCustom },
  giftConfig: undefined,
});
