import React, { ReactNode } from "react";
import { ConfigContext } from "../../../../utils/ConfigContext";
import {
  Button,
  Collapse,
  Form,
  message,
  Select,
  Space,
  Typography,
} from "antd";
import {
  DanmuViewCustomConfig,
  DanmuViewStyleConfig,
  defaultViewCustomInternalName,
  getDefaultDanmuViewCustomConfig,
} from "../../../../../../utils/config/Config";
import { TextIconModifier } from "./texticonmodifier/TextIconModifier";
import { ConfigItem } from "../../../../../../component/configitem/ConfigItem";

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

              <ConfigItem
                type={"string"}
                disabled={state.selectedStyle == defaultViewCustomInternalName}
                name={"配置名"}
                value={cDvc.name}
                setString={(value) => {
                  if (value == "") {
                    message.warning("名称不能为空").then();
                  } else if (styleNameList.includes(value)) {
                    message.warning("名称不能重复").then();
                  } else {
                    setDvc({ ...cDvc, name: value });
                  }
                }}
              />

              <ConfigItem
                type={"number"}
                name={"最大弹幕数"}
                description={<div>弹幕查看器中保留的最大弹幕数</div>}
                value={cDvc.maxDanmuNumber}
                min={1}
                setNumber={(value) => {
                  setDvc({ ...cDvc, maxDanmuNumber: value });
                }}
              />

              <ConfigItem
                type={"boolean"}
                name={"显示状态栏"}
                description={<div>在弹幕查看器底部显示信息</div>}
                value={cDvc.statusBarDisplay}
                setBoolean={(value) => {
                  setDvc({ ...cDvc, statusBarDisplay: value });
                }}
              />

              <ConfigItem
                type={"boolean"}
                name={"置顶SC"}
                description={<div>在SC持续时间内保持SC的显示</div>}
                value={cDvc.superChatAlwaysOnTop}
                setBoolean={(value) => {
                  setDvc({ ...cDvc, superChatAlwaysOnTop: value });
                }}
              />

              <Collapse>
                <Collapse.Panel key={"tts"} header={"语音播报"}>
                  <ConfigItem
                    type={"boolean"}
                    name={"启用"}
                    value={cDvc.tts.enable}
                    setBoolean={(value) => {
                      setDvc({
                        ...cDvc,
                        tts: {
                          ...cDvc.tts,
                          enable: value,
                        },
                      });
                    }}
                  />

                  <ConfigItem
                    type={"number"}
                    name={"播放列表长度上限"}
                    description={
                      <div>当播放列表长度达到上限时会忽略新的弹幕</div>
                    }
                    value={cDvc.tts.maxPlayListItemNum}
                    min={1}
                    setNumber={(value) => {
                      setDvc({
                        ...cDvc,
                        tts: {
                          ...cDvc.tts,
                          maxPlayListItemNum: value,
                        },
                      });
                    }}
                  />

                  <ConfigItem
                    type={"string"}
                    name={"速度"}
                    description={
                      <div>
                        数字或表达式 <br />
                        text: 播报内容
                      </div>
                    }
                    value={cDvc.tts.rate}
                    setString={(value) => {
                      setDvc({
                        ...cDvc,
                        tts: {
                          ...cDvc.tts,
                          rate: value,
                        },
                      });
                    }}
                  />

                  <ConfigItem
                    type={"string"}
                    name={"音高"}
                    description={
                      <div>
                        数字或表达式 <br />
                        text: 播报内容
                      </div>
                    }
                    value={cDvc.tts.pitch}
                    setString={(value) => {
                      setDvc({
                        ...cDvc,
                        tts: {
                          ...cDvc.tts,
                          pitch: value,
                        },
                      });
                    }}
                  />

                  <ConfigItem
                    type={"string"}
                    name={"音量"}
                    description={
                      <div>
                        数字或表达式 <br />
                        text: 播报内容
                      </div>
                    }
                    value={cDvc.tts.volume}
                    setString={(value) => {
                      setDvc({
                        ...cDvc,
                        tts: {
                          ...cDvc.tts,
                          volume: value,
                        },
                      });
                    }}
                  />

                  <ConfigItem
                    type={"boolean"}
                    name={"播报用户名"}
                    description={<div>在播报时带上 "xxx说"</div>}
                    value={cDvc.tts.danmu.speakUserName}
                    setBoolean={(value) => {
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

                  <ConfigItem
                    type={"number"}
                    name={"过滤同内容弹幕的延迟"}
                    description={
                      <div>
                        单位: 秒
                        <br />
                        过滤指定时间内的重复弹幕 (即使不同用户)
                      </div>
                    }
                    value={cDvc.tts.danmu.filterDuplicateContentDelay}
                    min={1}
                    setNumber={(value) => {
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
                </Collapse.Panel>
                <Collapse.Panel key={"numberFormat"} header={"数字格式化"}>
                  <Typography.Paragraph type={"secondary"}>
                    例: 10000 格式化后为 1万
                  </Typography.Paragraph>
                  <ConfigItem
                    type={"boolean"}
                    name={"格式化人气"}
                    value={cDvc.numberFormat.formatActivity}
                    setBoolean={(value) => {
                      setDvc({
                        ...cDvc,
                        numberFormat: {
                          ...cDvc.numberFormat,
                          formatActivity: value,
                        },
                      });
                    }}
                  />

                  <ConfigItem
                    type={"boolean"}
                    name={"格式化粉丝数"}
                    value={cDvc.numberFormat.formatFansNum}
                    setBoolean={(value) => {
                      setDvc({
                        ...cDvc,
                        numberFormat: {
                          ...cDvc.numberFormat,
                          formatFansNum: value,
                        },
                      });
                    }}
                  />
                </Collapse.Panel>
                <Collapse.Panel key={"style"} header={"外观"}>
                  <Typography.Paragraph type={"secondary"}>
                    单位:
                    <br />
                    em: 相对于字体大小 2em为2倍字体大小
                    <br />
                    vw/vh: 相对于窗口宽度/高度 1vw为1%窗口宽度
                  </Typography.Paragraph>

                  <ConfigItem
                    type={"string"}
                    name={"列表外边距"}
                    description={<div>弹幕列表的外边距</div>}
                    value={dvcStyle.listMargin}
                    setString={(value) => {
                      setDvcStyle({
                        ...dvcStyle,
                        listMargin: value,
                      });
                    }}
                  />

                  <ConfigItem
                    type={"string"}
                    name={"背景颜色"}
                    description={
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
                    value={dvcStyle.mainStyle.backgroundColor}
                    setString={(value) => {
                      setDvcStyle({
                        ...dvcStyle,
                        mainStyle: {
                          ...dvcStyle.mainStyle,
                          backgroundColor: value,
                        },
                      });
                    }}
                  />

                  <ConfigItem
                    type={"number"}
                    name={"缩放"}
                    value={dvcStyle.mainStyle.zoom}
                    min={0.1}
                    step={0.1}
                    setNumber={(value) => {
                      setDvcStyle({
                        ...dvcStyle,
                        mainStyle: { ...dvcStyle.mainStyle, zoom: value },
                      });
                    }}
                  />

                  <ConfigItem
                    type={"string"}
                    name={"行高"}
                    value={dvcStyle.mainStyle.lineHeight}
                    setString={(value) => {
                      setDvcStyle({
                        ...dvcStyle,
                        mainStyle: {
                          ...dvcStyle.mainStyle,
                          lineHeight: value,
                        },
                      });
                    }}
                  />

                  <ConfigItem
                    type={"string"}
                    name={"礼物图标高度"}
                    value={dvcStyle.giftIcon.height}
                    setString={(value) => {
                      setDvcStyle({
                        ...dvcStyle,
                        giftIcon: {
                          ...dvcStyle.giftIcon,
                          height: value,
                        },
                      });
                    }}
                  />

                  <ConfigItem
                    type={"color"}
                    name={"文字颜色"}
                    value={dvcStyle.mainStyle.color}
                    setString={(value) => {
                      setDvcStyle({
                        ...dvcStyle,
                        mainStyle: {
                          ...dvcStyle.mainStyle,
                          color: value,
                        },
                      });
                    }}
                  />

                  <ConfigItem
                    type={"color"}
                    name={"用户名颜色"}
                    value={dvcStyle.userName.color}
                    setString={(value) => {
                      setDvcStyle({
                        ...dvcStyle,
                        userName: {
                          ...dvcStyle.userName,
                          color: value,
                        },
                      });
                    }}
                  />

                  <ConfigItem
                    type={"color"}
                    name={"弹幕文字颜色"}
                    value={dvcStyle.danmuContent.color}
                    setString={(value) => {
                      setDvcStyle({
                        ...dvcStyle,
                        danmuContent: {
                          ...dvcStyle.danmuContent,
                          color: value,
                        },
                      });
                    }}
                  />
                  <Collapse>
                    <Collapse.Panel key={"fontSettings"} header={"字体设置"}>
                      <ConfigItem
                        type={"string"}
                        name={"字体"}
                        value={dvcStyle.mainStyle.fontFamily}
                        setString={(value) => {
                          setDvcStyle({
                            ...dvcStyle,
                            mainStyle: {
                              ...dvcStyle.mainStyle,
                              fontFamily: value,
                            },
                          });
                        }}
                      />
                      <ConfigItem
                        type={"string"}
                        name={"字体大小"}
                        value={dvcStyle.mainStyle.fontSize}
                        setString={(value) => {
                          setDvcStyle({
                            ...dvcStyle,
                            mainStyle: {
                              ...dvcStyle.mainStyle,
                              fontSize: value,
                            },
                          });
                        }}
                      />
                      <ConfigItem
                        type={"number"}
                        name={"字重"}
                        value={dvcStyle.mainStyle.fontWeight}
                        min={0}
                        setNumber={(value) => {
                          setDvcStyle({
                            ...dvcStyle,
                            mainStyle: {
                              ...dvcStyle.mainStyle,
                              fontWeight: value,
                            },
                          });
                        }}
                      />
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
