import React from "react";
import { Config, getDefaultConfig } from "../../../utils/config/Config";

export const ConfigContext = React.createContext({
  config: { ...getDefaultConfig() },
  setConfig: (config: Config): void => {
    console.log(config);
  },
});
