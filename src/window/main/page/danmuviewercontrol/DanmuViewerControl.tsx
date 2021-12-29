import React, { ReactNode } from "react";
import { Button, Divider, Form, Select, Space, Typography } from "antd";
import { ConfigContext } from "../../utils/ConfigContext";
import {
  getDefaultConfig,
  defaultViewCustomInternalName,
  DanmuViewCustomConfig,
} from "../../../../utils/config/Config";

class Props {}

class State {
  selectedStyle: string;
}

export class DanmuViewerSwitch extends React.Component {
  render(): ReactNode {
    return (
      <Space>
        <Typography.Text>悬浮窗开关:</Typography.Text>
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
    );
  }
}

export class DanmuViewerControl extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      selectedStyle: defaultViewCustomInternalName,
    };
  }

  render(): ReactNode {
    return (
      <ConfigContext.Consumer>
        {({ get }) => {
          const state = this.state;

          const dvcs = get("danmuViewCustoms") as DanmuViewCustomConfig[];

          const styleNameList = dvcs.map((value) => {
            return value.name;
          });
          const styleOptionList = dvcs.map((value) => {
            return (
              <Select.Option key={value.name} value={value.name}>
                {value.name}
              </Select.Option>
            );
          });

          const verifiedSelectedStyle = styleNameList.includes(
            state.selectedStyle
          )
            ? state.selectedStyle
            : styleNameList.length > 0
            ? styleNameList[0]
            : "";

          let link = `http://localhost:${get("httpServerPort")}/viewer`;
          const param = new URLSearchParams();

          if (
            get("danmuViewConfig.maxReconnectAttemptNumber") !=
            getDefaultConfig().danmuViewConfig.maxReconnectAttemptNumber
          ) {
            param.append(
              "maxReconnectAttemptNum",
              (
                get("danmuViewConfig.maxReconnectAttemptNumber") as number
              ).toString(10)
            );
          }
          if (state.selectedStyle != defaultViewCustomInternalName) {
            param.append("name", this.state.selectedStyle);
          }

          if (param.toString().length > 0) {
            link += "?";
            link += param.toString();
          }

          return (
            <div>
              <Divider orientation={"left"}>在悬浮窗中查看弹幕</Divider>

              <DanmuViewerSwitch />

              <Divider orientation={"left"}>在其他应用中查看弹幕</Divider>

              <Typography.Paragraph type={"secondary"}>
                选择你想使用的配置后复制链接至其他应用中
              </Typography.Paragraph>
              <Typography.Paragraph type={"secondary"}>
                OBS: 添加浏览器源后将链接复制至URL栏中,
                删除自定义CSS中的所有内容
                <br />
                修改大小请使用属性内的高度和宽度,
                不要直接在预览中拖动或使用变换, 否则可能会导致奇怪的效果
              </Typography.Paragraph>
              <Typography.Paragraph type={"secondary"}>
                浏览器: 直接当网页打开即可
              </Typography.Paragraph>
              <Typography.Paragraph type={"secondary"}>
                其他设备: 需要将链接中的 localhost 替换为本机的ip地址,
                确保防火墙中放行端口 {get("httpServerPort")}
              </Typography.Paragraph>

              <Form.Item label={"要使用的配置"}>
                <Space>
                  <Select
                    showSearch
                    style={{ minWidth: "7em" }}
                    value={verifiedSelectedStyle}
                    onChange={(value) => {
                      this.setState({ selectedStyle: value });
                    }}
                  >
                    {styleOptionList}
                  </Select>
                </Space>
              </Form.Item>

              <Typography.Paragraph>
                <Typography.Text>链接: </Typography.Text>
                <Typography.Text copyable>{link}</Typography.Text>
              </Typography.Paragraph>
            </div>
          );
        }}
      </ConfigContext.Consumer>
    );
  }
}
