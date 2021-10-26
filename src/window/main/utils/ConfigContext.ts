import React from "react";
import { Config, defaultConfig } from "../../../utils/config/Config";

export const ConfigContext = React.createContext({
  config: { ...defaultConfig },
  setConfig: (config: Config): void => {
    console.log(config);
  },
});
