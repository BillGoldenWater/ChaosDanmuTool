import React, { ReactNode } from "react";
import { Button, Collapse, Divider, message, Space } from "antd";
import { MainConfigModifier } from "./configmodifier/mainconfigmodifier/MainConfigModifier";
import { DanmuViewConfigModifier } from "./configmodifier/danmuviewconfigmodifier/DanmuViewConfigModifier";
import { DanmuViewCustomsModifier } from "./configmodifier/danmuviewcustomsmodifier/DanmuViewCustomsModifier";
import { ConfigContext } from "../../utils/ConfigContext";
import { defaultConfig } from "../../../../utils/config/Config";

export class Settings extends React.Component {
  render(): ReactNode {
    return (
      <div>
        <ConfigContext.Consumer>
          {({ setConfig }) => {
            return (
              <Space>
                <Button
                  onClick={() => {
                    window.electron.loadConfig();
                    setConfig(JSON.parse(window.electron.getConfig()));
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
                    message.success("重置成功").then();
                  }}
                >
                  重置
                </Button>
              </Space>
            );
          }}
        </ConfigContext.Consumer>
        <Divider />
        <Collapse defaultActiveKey={"mainSettings"}>
          <Collapse.Panel key={"mainSettings"} header={"主要设置"}>
            <MainConfigModifier />
          </Collapse.Panel>
          <Collapse.Panel key={"danmuViewSettings"} header={"弹幕查看器设置"}>
            <DanmuViewConfigModifier />
          </Collapse.Panel>
          <Collapse.Panel key={"danmuViewCustoms"} header={"弹幕查看器自定义"}>
            <DanmuViewCustomsModifier />
          </Collapse.Panel>
        </Collapse>
      </div>
    );
  }
}
