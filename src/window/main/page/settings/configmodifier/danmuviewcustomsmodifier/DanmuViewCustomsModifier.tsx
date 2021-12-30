import React, { ReactNode } from "react";
import { ConfigContext, TConfigContext } from "../../../../utils/ConfigContext";
import dotProp from "dot-prop";
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
  BlackListMatchConfig,
  DanmuViewCustomConfig,
  defaultViewCustomInternalName,
  getDefaultDanmuViewCustomConfig,
  TextReplacerConfig,
} from "../../../../../../utils/config/Config";
import { TextIconModifier } from "./texticonmodifier/TextIconModifier";
import { ConfigItem } from "../../../../../../component/configitem/ConfigItem";
import { TextReplacerModifier } from "./textreplacermodifier/TextReplacerModifier";
import { BlackListMatchModifier } from "./blacklistmatchmodifier/BlackListMatchModifier";

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
        {({ set, get }) => {
          const state = this.state;

          const dvcs = get("danmuViewCustoms") as DanmuViewCustomConfig[];
          const setDvcs = (danmuViewCustoms: DanmuViewCustomConfig[]) => {
            set("danmuViewCustoms", danmuViewCustoms);
          };

          const styleOptionList = dvcs.map((value) => {
            return (
              <Select.Option key={value.name} value={value.name}>
                {value.name}
              </Select.Option>
            );
          });

          const styleNameList = dvcs.map((value) => {
            return value.name;
          });

          const verifiedSelectedStyle = styleNameList.includes(
            state.selectedStyle
          )
            ? state.selectedStyle
            : styleNameList.length > 0
            ? styleNameList[0]
            : "";

          const dvcL = dvcs.filter((value) => {
            return value.name == verifiedSelectedStyle;
          });

          const dvc =
            dvcL.length > 0 ? dvcL[0] : getDefaultDanmuViewCustomConfig();

          const dvcGet = (key: string, defaultValue?: unknown) => {
            return dotProp.get(dvc, key, defaultValue);
          };

          const dvcSet = (key: string, value: unknown) => {
            // const tempList = dvcs.filter((value) => {
            //   return value.name != cDvc.name;
            // });
            // tempList.push(viewCustomConfig);
            // setConfig({...config, danmuViewCustoms: tempList});
            // this.setState({selectedStyle: viewCustomConfig.name});

            dotProp.set(dvc, key, value);
            set("danmuViewCustoms", dvcs);
          };

          const dvcContext: TConfigContext = {
            get: dvcGet,
            set: dvcSet,
            updateConfig: null,
          };

          const dvcStyleGet = (key: string, defaultValue?: unknown) => {
            return dvcGet(`style.${key}`, defaultValue);
          };

          const dvcStyleSet = (key: string, value: unknown) => {
            dvcSet(`style.${key}`, value);
          };

          const dvcStyleContext: TConfigContext = {
            get: dvcStyleGet,
            set: dvcStyleSet,
            updateConfig: null,
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
                configContext={dvcContext}
                type={"string"}
                disabled={state.selectedStyle == defaultViewCustomInternalName}
                name={"配置名"}
                valueKey={"name"}
                setString={(value) => {
                  if (value == "") {
                    message.warning("名称不能为空").then();
                  } else if (styleNameList.includes(value)) {
                    message.warning("名称不能重复").then();
                  } else {
                    dvcSet("name", value);
                  }
                }}
              />

              <ConfigItem
                configContext={dvcContext}
                type={"number"}
                name={"最大弹幕数"}
                description={<div>弹幕查看器中保留的最大弹幕数</div>}
                valueKey={"maxDanmuNumber"}
                min={1}
              />

              <ConfigItem
                configContext={dvcContext}
                type={"boolean"}
                name={"显示状态栏"}
                description={<div>在弹幕查看器底部显示信息</div>}
                valueKey={"statusBarDisplay"}
              />

              <ConfigItem
                configContext={dvcContext}
                type={"boolean"}
                name={"置顶SC"}
                description={<div>在SC持续时间内保持SC的显示</div>}
                valueKey={"superChatAlwaysOnTop"}
              />

              <Collapse>
                <Collapse.Panel key={"tts"} header={"语音播报"}>
                  <ConfigItem
                    configContext={dvcContext}
                    type={"boolean"}
                    name={"启用"}
                    valueKey={"tts.enable"}
                  />

                  <ConfigItem
                    configContext={dvcContext}
                    type={"number"}
                    name={"播放列表长度上限"}
                    description={
                      <div>当播放列表长度达到上限时会忽略新的弹幕</div>
                    }
                    min={1}
                    valueKey={"tts.maxPlayListItemNum"}
                  />

                  <ConfigItem
                    configContext={dvcContext}
                    type={"string"}
                    name={"速度"}
                    description={
                      <div>
                        数字或表达式 <br />
                        text: 播报内容
                      </div>
                    }
                    valueKey={"tts.rate"}
                  />

                  <ConfigItem
                    configContext={dvcContext}
                    type={"string"}
                    name={"音高"}
                    description={
                      <div>
                        数字或表达式 <br />
                        text: 播报内容
                      </div>
                    }
                    valueKey={"tts.pitch"}
                  />

                  <ConfigItem
                    configContext={dvcContext}
                    type={"string"}
                    name={"音量"}
                    description={
                      <div>
                        数字或表达式 <br />
                        text: 播报内容
                      </div>
                    }
                    valueKey={"tts.volume"}
                  />

                  <Collapse>
                    <Collapse.Panel
                      key={"textReplacer"}
                      header={"文本替换"}
                      style={{ padding: "0" }}
                    >
                      <TextReplacerModifier
                        list={
                          dvcGet("tts.textReplacer") as TextReplacerConfig[]
                        }
                        setList={(value) => {
                          dvcSet("tts.textReplacer", value);
                        }}
                      />
                    </Collapse.Panel>
                    <Collapse.Panel
                      key={"blackListMatch"}
                      header={"黑名单匹配"}
                    >
                      <BlackListMatchModifier
                        list={
                          dvcGet("tts.blackListMatch") as BlackListMatchConfig[]
                        }
                        setList={(value) => {
                          dvcSet("tts.blackListMatch", value);
                        }}
                      />
                    </Collapse.Panel>
                    <Collapse.Panel key={"danmuSetting"} header={"弹幕相关"}>
                      <ConfigItem
                        configContext={dvcContext}
                        type={"boolean"}
                        valueKey={"tts.danmu.speakUserName"}
                        name={"播报用户名"}
                        description={<div>在播报时带上 "xxx说"</div>}
                      />

                      <ConfigItem
                        configContext={dvcContext}
                        type={"number"}
                        valueKey={"tts.danmu.filterDuplicateContentDelay"}
                        min={1}
                        name={"过滤同内容弹幕的延迟"}
                        description={
                          <div>
                            单位: 秒
                            <br />
                            过滤指定时间内的重复弹幕 (即使不同用户)
                          </div>
                        }
                      />
                    </Collapse.Panel>
                  </Collapse>
                </Collapse.Panel>
                <Collapse.Panel key={"numberFormat"} header={"数字格式化"}>
                  <Typography.Paragraph type={"secondary"}>
                    例: 10000 格式化后为 1万
                  </Typography.Paragraph>
                  <ConfigItem
                    configContext={dvcContext}
                    type={"boolean"}
                    valueKey={"numberFormat.formatActivity"}
                    name={"格式化人气"}
                  />

                  <ConfigItem
                    configContext={dvcContext}
                    type={"boolean"}
                    valueKey={"numberFormat.formatFansNum"}
                    name={"格式化粉丝数"}
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
                    configContext={dvcStyleContext}
                    type={"string"}
                    valueKey={"listMargin"}
                    name={"列表外边距"}
                    description={<div>弹幕列表的外边距</div>}
                  />

                  <ConfigItem
                    configContext={dvcStyleContext}
                    type={"string"}
                    valueKey={"mainStyle.backgroundColor"}
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
                  />

                  <ConfigItem
                    configContext={dvcStyleContext}
                    type={"string"}
                    valueKey={"mainStyle.lineHeight"}
                    name={"行高"}
                  />

                  <ConfigItem
                    configContext={dvcStyleContext}
                    type={"string"}
                    valueKey={"giftIcon.height"}
                    name={"礼物图标高度"}
                  />

                  <ConfigItem
                    configContext={dvcStyleContext}
                    type={"color"}
                    valueKey={"mainStyle.color"}
                    name={"文字颜色"}
                  />

                  <ConfigItem
                    configContext={dvcStyleContext}
                    type={"color"}
                    valueKey={"userName.color"}
                    name={"用户名颜色"}
                  />

                  <ConfigItem
                    configContext={dvcStyleContext}
                    type={"color"}
                    valueKey={"danmuContent.color"}
                    name={"弹幕文字颜色"}
                  />
                  <Collapse>
                    <Collapse.Panel key={"fontSettings"} header={"字体设置"}>
                      <ConfigItem
                        configContext={dvcStyleContext}
                        type={"string"}
                        valueKey={"mainStyle.fontFamily"}
                        name={"字体"}
                      />
                      <ConfigItem
                        configContext={dvcStyleContext}
                        type={"string"}
                        valueKey={"mainStyle.fontSize"}
                        name={"字体大小"}
                      />
                      <ConfigItem
                        configContext={dvcStyleContext}
                        type={"number"}
                        valueKey={"mainStyle.fontWeight"}
                        min={0}
                        name={"字重"}
                      />
                    </Collapse.Panel>
                    <Collapse.Panel key={"iconSettings"} header={"图标设置"}>
                      <TextIconModifier
                        styleContext={dvcStyleContext}
                        valueKey={"vipIcon"}
                        name={"VIP图标"}
                      />
                      <TextIconModifier
                        styleContext={dvcStyleContext}
                        valueKey={"svipIcon"}
                        name={"SVIP图标"}
                      />
                      <TextIconModifier
                        styleContext={dvcStyleContext}
                        valueKey={"adminIcon"}
                        name={"房管图标"}
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
