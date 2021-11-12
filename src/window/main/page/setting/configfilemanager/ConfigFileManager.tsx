import React, { ReactNode } from "react";
import { FunctionCard } from "../../../../../component/functioncard/FunctionCard";
import { Button } from "../../../../../component/button/Button";
import { Config, defaultConfig } from "../../../../../utils/config/Config";
import { getConfigUpdateMessage } from "../../../../../utils/command/ConfigUpdate";
import { ConfigContext } from "../../../utils/ConfigContext";

export class ConfigFileManager extends React.Component {
  broadcastConfig(config: Config): void {
    window.electron.websocketBroadcast(
      JSON.stringify(getConfigUpdateMessage(config))
    );
  }

  render(): ReactNode {
    return (
      <ConfigContext.Consumer>
        {({ setConfig }) => (
          <FunctionCard name={"配置文件管理"}>
            <Button
              onClick={() => {
                window.electron.loadConfig();
                const config: Config = JSON.parse(window.electron.getConfig());
                this.broadcastConfig(config);
              }}
            >
              读取
            </Button>
            <Button
              onClick={() => {
                window.electron.saveConfig();
              }}
            >
              保存
            </Button>
            <Button
              onClick={() => {
                setConfig(defaultConfig);
              }}
            >
              重置
            </Button>
          </FunctionCard>
        )}
      </ConfigContext.Consumer>
    );
  }
}
