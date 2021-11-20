import React, { ReactNode } from "react";
import { ConfigContext } from "../../utils/ConfigContext";
import { Button, Divider, Space } from "antd";

export class DanmuViewerControl extends React.Component {
  render(): ReactNode {
    return (
      <ConfigContext.Consumer>
        {({ config, setConfig }) => {
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
            </div>
          );
        }}
      </ConfigContext.Consumer>
    );
  }
}
