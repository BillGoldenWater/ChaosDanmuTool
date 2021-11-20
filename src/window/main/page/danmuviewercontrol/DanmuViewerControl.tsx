import React, { ReactNode } from "react";
import { Button, Divider, Space } from "antd";
import { DanmuViewConfigModifier } from "../settings/configmodifier/danmuviewconfigmodifier/DanmuViewConfigModifier";

export class DanmuViewerControl extends React.Component {
  render(): ReactNode {
    return (
      <div>
        <Space>
          <Button
            onClick={() => {
              window.electron.openViewer();
            }}
          >
            打开
          </Button>
          <Button
            onClick={() => {
              window.electron.closeViewer();
            }}
          >
            关闭
          </Button>
        </Space>
        <Divider orientation={"left"}>设置</Divider>
        <DanmuViewConfigModifier />
      </div>
    );
  }
}
