import React, { ReactNode } from "react";
import { DanmuViewConfig } from "../../../../../../utils/config/Config";
import { FunctionCard } from "../../../../../../component/functioncard/FunctionCard";
import { ConfigContext } from "../../../../utils/ConfigContext";

export class DanmuViewConfigModifier extends React.Component {
  render(): ReactNode {
    return (
      <ConfigContext.Consumer>
        {({ config, setConfig }) => {
          const danmuViewConfig = config.danmuViewConfig;
          const setDanmuViewConfig = (viewConfig: DanmuViewConfig) => {
            setConfig({ ...config, danmuViewConfig: viewConfig });
          };
          return (
            <FunctionCard name={"弹幕查看器"}>
              <label>服务器端口: </label>
              <input
                value={danmuViewConfig.httpServerPort}
                onChange={(event) => {
                  setDanmuViewConfig({
                    ...danmuViewConfig,
                    httpServerPort: parseInt(event.target.value, 10),
                  });
                }}
              />
              <br />
              <label>最大重连次数: </label>
              <input
                value={danmuViewConfig.maxReconnectAttemptNumber}
                onChange={(event) => {
                  setDanmuViewConfig({
                    ...danmuViewConfig,
                    maxReconnectAttemptNumber: parseInt(event.target.value, 10),
                  });
                }}
              />
              <br />
              <label>宽度: </label>
              <input
                value={danmuViewConfig.width}
                onChange={(event) => {
                  setDanmuViewConfig({
                    ...danmuViewConfig,
                    width: parseInt(event.target.value, 10),
                  });
                }}
              />
              <br />
              <label>高度: </label>
              <input
                value={danmuViewConfig.height}
                onChange={(event) => {
                  setDanmuViewConfig({
                    ...danmuViewConfig,
                    height: parseInt(event.target.value, 10),
                  });
                }}
              />
              <br />
            </FunctionCard>
          );
        }}
      </ConfigContext.Consumer>
    );
  }
}
