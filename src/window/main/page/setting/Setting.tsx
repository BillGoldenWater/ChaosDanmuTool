import React from "react";
import style from "./Setting.module.css";
import { FunctionCard } from "../../../../component/functioncard/FunctionCard";
import { Button } from "../../../../component/button/Button";
import { getConfigUpdateMessage } from "../../../../utils/command/ConfigUpdate";
import { ConfigContext } from "../../utils/ConfigContext";
import { Config } from "../../../../utils/config/Config";

class Props {}

export class Setting extends React.Component<Props> {
  render(): JSX.Element {
    return (
      <ConfigContext.Consumer>
        {({ config, setConfig }) => {
          return (
            <div className={style.setting}>
              <FunctionCard name={"配置文件管理"}>
                <Button
                  onClick={() => {
                    window.electron.loadConfig();
                    const config: Config = JSON.parse(
                      window.electron.getConfig()
                    );
                    setConfig(config);
                    window.electron.websocketBroadcast(
                      getConfigUpdateMessage(config)
                    );
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
                    window.electron.websocketBroadcast(
                      getConfigUpdateMessage(config)
                    );
                  }}
                >
                  更新
                </Button>
              </FunctionCard>
            </div>
          );
        }}
      </ConfigContext.Consumer>
    );
  }
}
