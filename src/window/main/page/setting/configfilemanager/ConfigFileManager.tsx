import React, { ReactNode } from "react";
import { FunctionCard } from "../../../../../component/functioncard/FunctionCard";
import { Button } from "../../../../../component/button/Button";
import { Config } from "../../../../../utils/config/Config";
import { ConfigContext } from "../../../utils/ConfigContext";
import { getConfigUpdateMessage } from "../../../../../utils/command/ConfigUpdate";

export class ConfigFileManager extends React.Component {
  broadcastConfig(config: Config): void {
    window.electron.websocketBroadcast(getConfigUpdateMessage(config));
  }

  render(): ReactNode {
    return (
      <ConfigContext.Consumer>
        {({ config, setConfig }) => (
          <FunctionCard name={"配置文件管理"}>
            <Button
              onClick={() => {
                window.electron.loadConfig();
                const config: Config = JSON.parse(window.electron.getConfig());
                setConfig(config);
                this.broadcastConfig(config);
              }}
            >
              读取
            </Button>
            <Button
              onClick={() => {
                window.electron.updateConfig(JSON.stringify(config));
                window.electron.saveConfig();
              }}
            >
              保存
            </Button>
            <Button
              onClick={() => {
                setConfig(JSON.parse(window.electron.getConfig()));
                this.broadcastConfig(config);
              }}
            >
              更新
            </Button>
          </FunctionCard>
        )}
      </ConfigContext.Consumer>
    );
  }
}
