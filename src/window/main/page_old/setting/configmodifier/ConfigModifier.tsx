import React, { ReactNode } from "react";
import { ConfigContext } from "../../../utils/ConfigContext";
import { FunctionCard } from "../../../../../component/functioncard/FunctionCard";
import { DanmuReceiverConfigModifier } from "./danmureceiverconfigmodifier/DanmuReceiverConfigModifier";
import { DanmuViewConfigModifier } from "./danmuviewconfigmodifier/DanmuViewConfigModifier";
import { DanmuViewCustomsModifier } from "./danmuviewcustomsmodifier/DanmuViewCustomsModifier";

export class ConfigModifier extends React.Component {
  render(): ReactNode {
    return (
      <ConfigContext.Consumer>
        {({ config, setConfig }) => {
          return (
            <FunctionCard name={"设置"}>
              <label>退出时自动保存配置文件:</label>
              <input
                type={"checkbox"}
                checked={config.autoSaveOnQuit}
                onChange={(event) => {
                  setConfig({
                    ...config,
                    autoSaveOnQuit: event.target.checked,
                  });
                }}
              />
              <br />
              <label>更改时自动保存配置文件:</label>
              <input
                type={"checkbox"}
                checked={config.autoSaveOnChange}
                onChange={(event) => {
                  setConfig({
                    ...config,
                    autoSaveOnChange: event.target.checked,
                  });
                }}
              />
              <br />

              <br />
              <DanmuReceiverConfigModifier />
              <DanmuViewConfigModifier />
              <DanmuViewCustomsModifier />
            </FunctionCard>
          );
        }}
      </ConfigContext.Consumer>
    );
  }
}
