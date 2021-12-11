import React, { ReactNode } from "react";
import { ConfigContext } from "../../../../utils/ConfigContext";
import {
  Button,
  Collapse,
  Form,
  Input,
  InputNumber,
  message,
  Popover,
  Select,
  Space,
  Switch,
  Typography,
} from "antd";
import {
  DanmuViewCustomConfig,
  DanmuViewStyleConfig,
  defaultViewCustomInternalName,
  getDefaultDanmuViewCustomConfig,
} from "../../../../../../utils/config/Config";
import { QuestionCircleOutlined } from "@ant-design/icons";
import { TextIconModifier } from "./texticonmodifier/TextIconModifier";

class Props {}

class State {
  selectedStyle: string;
}

export class DanmuViewCustomsModifier extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      selectedStyle: defaultViewCustomInternalName,
    };
  }

  createCustomItem(
    dvc: DanmuViewCustomConfig[],
    setDvc: (dvc: DanmuViewCustomConfig[]) => void,
    name: string
  ): string {
    const hasSameName =
      dvc.filter((value) => {
        return value.name == name;
      }).length > 0;

    if (hasSameName) {
      return "已有同名配置";
    }

    dvc.push({ ...getDefaultDanmuViewCustomConfig(), name: name });

    setDvc(dvc);

    return "";
  }

  deleteCustomItem(
    dvc: DanmuViewCustomConfig[],
    setDvc: (dvc: DanmuViewCustomConfig[]) => void,
    name: string
  ): void {
    setDvc(
      dvc.filter((value) => {
        return value.name != name;
      })
    );
  }

  render(): ReactNode {
    return (
      <ConfigContext.Consumer>
        {({ config, setConfig }) => {
          const state = this.state;

          const dvcs = config.danmuViewCustoms;
          const setDvcs = (danmuViewCustoms: DanmuViewCustomConfig[]) => {
            setConfig({ ...config, danmuViewCustoms: danmuViewCustoms });
          };

          const styleOptionList = config.danmuViewCustoms.map((value) => {
            return (
              <Select.Option key={value.name} value={value.name}>
                {value.name}
              </Select.Option>
            );
          });

          const styleNameList = config.danmuViewCustoms.map((value) => {
            return value.name;
          });

          const verifiedSelectedStyle = styleNameList.includes(
            state.selectedStyle
          )
            ? state.selectedStyle
            : styleNameList.length > 0
            ? styleNameList[0]
            : "";

          const cDvcL = dvcs.filter((value) => {
            return value.name == verifiedSelectedStyle;
          });

          const cDvc =
            cDvcL.length > 0 ? cDvcL[0] : getDefaultDanmuViewCustomConfig();

          const setDvc = (viewCustomConfig: DanmuViewCustomConfig) => {
            const tempList = config.danmuViewCustoms.filter((value) => {
              return value.name != cDvc.name;
            });
            tempList.push(viewCustomConfig);
            setConfig({ ...config, danmuViewCustoms: tempList });
            this.setState({ selectedStyle: viewCustomConfig.name });
          };

          const dvcStyle = cDvc.style;
          const setDvcStyle = (style: DanmuViewStyleConfig) => {
            setDvc({ ...cDvc, style: style });
          };

          return (
            <div>
              <Form.Item label={"当前修改的配置:"}>
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
                  <Button
                    onClick={() => {
                      const name = "new";
                      const result = this.createCustomItem(dvcs, setDvcs, name);
                      if (result) {
                        message.error(result).then();
                      } else {
                        message.success("创建成功").then();
                        this.setState({ selectedStyle: name });
                      }
                    }}
                  >
                    新建
                  </Button>
                  <Button
                    disabled={
                      state.selectedStyle == defaultViewCustomInternalName ||
                      state.selectedStyle == ""
                    }
                    onClick={() => {
                      this.deleteCustomItem(dvcs, setDvcs, state.selectedStyle);
                      message
                        .success(`成功的删除了配置 "${state.selectedStyle}"`)
                        .then();
                      this.setState({
                        selectedStyle: defaultViewCustomInternalName,
                      });
                    }}
                  >
                    删除
                  </Button>
                </Space>
              </Form.Item>

              <Form.Item label={"配置名"}>
                <Space>
                  <Input
                    disabled={
                      state.selectedStyle == defaultViewCustomInternalName
                    }
                    value={cDvc.name}
                    onChange={(event) => {
                      if (event.target.value == "") {
                        message.warning("名称不能为空").then();
                      } else if (styleNameList.includes(event.target.value)) {
                        message.warning("名称不能重复").then();
                      } else {
                        setDvc({ ...cDvc, name: event.target.value });
                      }
                    }}
                  />
                </Space>
              </Form.Item>

              <Form.Item label={"最大弹幕数:"}>
                <Space>
                  <InputNumber
                    min={1}
                    defaultValue={cDvc.maxDanmuNumber}
                    onChange={(value) => {
                      setDvc({ ...cDvc, maxDanmuNumber: value });
                    }}
                  />
                  <Popover content={<div>弹幕查看器中保留的最大弹幕数</div>}>
                    <QuestionCircleOutlined />
                  </Popover>
                </Space>
              </Form.Item>

              <Form.Item label={"显示状态栏"}>
                <Space>
                  <Switch
                    checked={cDvc.statusBarDisplay}
                    onChange={(value) => {
                      setDvc({ ...cDvc, statusBarDisplay: value });
                    }}
                  />
                  <Popover content={<div>在弹幕查看器底部显示信息</div>}>
                    <QuestionCircleOutlined />
                  </Popover>
                </Space>
              </Form.Item>

              <Form.Item label={"置顶SC"}>
                <Space>
                  <Switch
                    checked={cDvc.superChatAlwaysOnTop}
                    onChange={(value) => {
                      setDvc({ ...cDvc, superChatAlwaysOnTop: value });
                    }}
                  />
                  <Popover content={<div>在SC持续时间内保持SC的显示</div>}>
                    <QuestionCircleOutlined />
                  </Popover>
                </Space>
              </Form.Item>

              <Collapse>
                <Collapse.Panel key={"tts"} header={"语音播报"}>
                  <Form.Item label={"启用"}>
                    <Switch
                      checked={cDvc.tts.enable}
                      onChange={(value) => {
                        setDvc({
                          ...cDvc,
                          tts: {
                            ...cDvc.tts,
                            enable: value,
                          },
                        });
                      }}
                    />
                  </Form.Item>

                  <Form.Item label={"播放列表长度上限"}>
                    <Space>
                      <InputNumber
                        min={1}
                        defaultValue={cDvc.tts.maxPlayListItemNum}
                        onChange={(value) => {
                          setDvc({
                            ...cDvc,
                            tts: {
                              ...cDvc.tts,
                              maxPlayListItemNum: value,
                            },
                          });
                        }}
                      />

                      <Popover
                        content={
                          <div>当播放列表长度达到上限时会忽略新的弹幕</div>
                        }
                      >
                        <QuestionCircleOutlined />
                      </Popover>
                    </Space>
                  </Form.Item>

                  <Form.Item label={"播报用户名"}>
                    <Space>
                      <Switch
                        checked={cDvc.tts.danmu.speakUserName}
                        onChange={(value) => {
                          setDvc({
                            ...cDvc,
                            tts: {
                              ...cDvc.tts,
                              danmu: {
                                ...cDvc.tts.danmu,
                                speakUserName: value,
                              },
                            },
                          });
                        }}
                      />
                      <Popover content={<div>在播报时带上 "xxx说"</div>}>
                        <QuestionCircleOutlined />
                      </Popover>
                    </Space>
                  </Form.Item>

                  <Form.Item label={"过滤同内容弹幕的延迟"}>
                    <Space>
                      <InputNumber
                        min={1}
                        defaultValue={
                          cDvc.tts.danmu.filterDuplicateContentDelay
                        }
                        onChange={(value) => {
                          setDvc({
                            ...cDvc,
                            tts: {
                              ...cDvc.tts,
                              danmu: {
                                ...cDvc.tts.danmu,
                                filterDuplicateContentDelay: value,
                              },
                            },
                          });
                        }}
                      />
                      <Popover
                        content={
                          <div>
                            单位: 秒
                            <br />
                            过滤指定时间内的重复弹幕 (即使不同用户)
                          </div>
                        }
                      >
                        <QuestionCircleOutlined />
                      </Popover>
                    </Space>
                  </Form.Item>
                </Collapse.Panel>
                <Collapse.Panel key={"numberFormat"} header={"数字格式化"}>
                  <Typography.Paragraph type={"secondary"}>
                    例: 10000 格式化后为 1万
                  </Typography.Paragraph>
                  <Form.Item label={"格式化人气"}>
                    <Switch
                      checked={cDvc.numberFormat.formatActivity}
                      onChange={(value) => {
                        setDvc({
                          ...cDvc,
                          numberFormat: {
                            ...cDvc.numberFormat,
                            formatActivity: value,
                          },
                        });
                      }}
                    />
                  </Form.Item>
                  <Form.Item label={"格式化粉丝数"}>
                    <Switch
                      checked={cDvc.numberFormat.formatFansNum}
                      onChange={(value) => {
                        setDvc({
                          ...cDvc,
                          numberFormat: {
                            ...cDvc.numberFormat,
                            formatFansNum: value,
                          },
                        });
                      }}
                    />
                  </Form.Item>
                </Collapse.Panel>
                <Collapse.Panel key={"style"} header={"外观"}>
                  <Typography.Paragraph type={"secondary"}>
                    单位:
                    <br />
                    em: 相对于字体大小 2em为2倍字体大小
                    <br />
                    vw/vh: 相对于窗口宽度/高度 1vw为1%窗口宽度
                  </Typography.Paragraph>

                  <Form.Item label={"列表外边距"}>
                    <Space>
                      <Input
                        value={dvcStyle.listMargin}
                        onChange={(event) => {
                          setDvcStyle({
                            ...dvcStyle,
                            listMargin: event.target.value,
                          });
                        }}
                      />
                      <Popover content={<div>弹幕列表的外边距</div>}>
                        <QuestionCircleOutlined />
                      </Popover>
                    </Space>
                  </Form.Item>

                  <Form.Item label={"背景颜色"}>
                    <Space>
                      <Input
                        value={dvcStyle.mainStyle.backgroundColor}
                        onChange={(event) => {
                          setDvcStyle({
                            ...dvcStyle,
                            mainStyle: {
                              ...dvcStyle.mainStyle,
                              backgroundColor: event.target.value,
                            },
                          });
                        }}
                      />
                      <Popover
                        content={
                          <div>
                            弹幕查看器的背景颜色 16进制 格式为rrggbbaa
                            a为Alpha通道(透明度)
                            <br />
                            第三方
                            <Typography.Text
                              copyable={{
                                text: "https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_Colors/Color_picker_tool",
                                tooltips: [
                                  <div>复制链接</div>,
                                  <div>复制成功</div>,
                                ],
                              }}
                            >
                              编辑器
                            </Typography.Text>
                          </div>
                        }
                      >
                        <QuestionCircleOutlined />
                      </Popover>
                    </Space>
                  </Form.Item>

                  <Form.Item label={"缩放"}>
                    <InputNumber
                      min={0.1}
                      defaultValue={dvcStyle.mainStyle.zoom}
                      step={0.1}
                      onChange={(value) => {
                        setDvcStyle({
                          ...dvcStyle,
                          mainStyle: { ...dvcStyle.mainStyle, zoom: value },
                        });
                      }}
                    />
                  </Form.Item>

                  <Form.Item label={"行高"}>
                    <Space>
                      <Input
                        value={dvcStyle.mainStyle.lineHeight}
                        onChange={(event) => {
                          setDvcStyle({
                            ...dvcStyle,
                            mainStyle: {
                              ...dvcStyle.mainStyle,
                              lineHeight: event.target.value,
                            },
                          });
                        }}
                      />
                    </Space>
                  </Form.Item>

                  <Form.Item label={"礼物图标高度"}>
                    <Space>
                      <Input
                        value={dvcStyle.giftIcon.height}
                        onChange={(event) => {
                          setDvcStyle({
                            ...dvcStyle,
                            giftIcon: {
                              ...dvcStyle.giftIcon,
                              height: event.target.value,
                            },
                          });
                        }}
                      />
                    </Space>
                  </Form.Item>

                  <Form.Item label={"文字颜色"}>
                    <Space>
                      <Input
                        type={"color"}
                        style={{ minWidth: "5em" }}
                        value={dvcStyle.mainStyle.color}
                        onChange={(event) => {
                          setDvcStyle({
                            ...dvcStyle,
                            mainStyle: {
                              ...dvcStyle.mainStyle,
                              color: event.target.value,
                            },
                          });
                        }}
                      />
                    </Space>
                  </Form.Item>

                  <Form.Item label={"用户名颜色"}>
                    <Space>
                      <Input
                        type={"color"}
                        style={{ minWidth: "5em" }}
                        value={dvcStyle.userName.color}
                        onChange={(event) => {
                          setDvcStyle({
                            ...dvcStyle,
                            userName: {
                              ...dvcStyle.userName,
                              color: event.target.value,
                            },
                          });
                        }}
                      />
                    </Space>
                  </Form.Item>

                  <Form.Item label={"弹幕文字颜色"}>
                    <Space>
                      <Input
                        type={"color"}
                        style={{ minWidth: "5em" }}
                        value={dvcStyle.danmuContent.color}
                        onChange={(event) => {
                          setDvcStyle({
                            ...dvcStyle,
                            danmuContent: {
                              ...dvcStyle.danmuContent,
                              color: event.target.value,
                            },
                          });
                        }}
                      />
                    </Space>
                  </Form.Item>

                  <Collapse>
                    <Collapse.Panel key={"fontSettings"} header={"字体设置"}>
                      <Form.Item label={"字体"}>
                        <Space>
                          <Input
                            value={dvcStyle.mainStyle.fontFamily}
                            onChange={(event) => {
                              setDvcStyle({
                                ...dvcStyle,
                                mainStyle: {
                                  ...dvcStyle.mainStyle,
                                  fontFamily: event.target.value,
                                },
                              });
                            }}
                          />
                        </Space>
                      </Form.Item>
                      <Form.Item label={"字体大小"}>
                        <Space>
                          <Input
                            value={dvcStyle.mainStyle.fontSize}
                            onChange={(event) => {
                              setDvcStyle({
                                ...dvcStyle,
                                mainStyle: {
                                  ...dvcStyle.mainStyle,
                                  fontSize: event.target.value,
                                },
                              });
                            }}
                          />
                        </Space>
                      </Form.Item>
                      <Form.Item label={"字重"}>
                        <Space>
                          <InputNumber
                            min={0}
                            value={dvcStyle.mainStyle.fontWeight}
                            onChange={(value) => {
                              setDvcStyle({
                                ...dvcStyle,
                                mainStyle: {
                                  ...dvcStyle.mainStyle,
                                  fontWeight: value,
                                },
                              });
                            }}
                          />
                        </Space>
                      </Form.Item>
                    </Collapse.Panel>
                    <Collapse.Panel key={"iconSettings"} header={"图标设置"}>
                      <TextIconModifier
                        name={"VIP图标"}
                        style={dvcStyle.vipIcon}
                        setStyle={(iconStyle) => {
                          setDvcStyle({ ...dvcStyle, vipIcon: iconStyle });
                        }}
                      />
                      <TextIconModifier
                        name={"SVIP图标"}
                        style={dvcStyle.svipIcon}
                        setStyle={(iconStyle) => {
                          setDvcStyle({ ...dvcStyle, svipIcon: iconStyle });
                        }}
                      />
                      <TextIconModifier
                        name={"房管图标"}
                        style={dvcStyle.adminIcon}
                        setStyle={(iconStyle) => {
                          setDvcStyle({ ...dvcStyle, adminIcon: iconStyle });
                        }}
                      />
                    </Collapse.Panel>
                  </Collapse>
                </Collapse.Panel>
              </Collapse>
            </div>
          );
        }}
      </ConfigContext.Consumer>
    );
  }
}
