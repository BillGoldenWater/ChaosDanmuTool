/*
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { ReactNode } from "react";
import { ConfigContext } from "../../../../utils/ConfigContext";
import { Alert, Collapse } from "antd";
import { ConfigItem } from "../../../../../../component/configitem/ConfigItem";

export class MainConfigModifier extends React.Component {
  render(): ReactNode {
    return (
      <ConfigContext.Consumer>
        {(configContext) => {
          return (
            <div>
              <ConfigItem
                configContext={configContext}
                type={"boolean"}
                valueKey={"darkTheme"}
                name={"黑暗主题"}
                description={
                  <div>
                    主题切换出现问题时请按下 Ctrl+R (macOS 为 ⌘ +R) 重新加载
                  </div>
                }
              />

              <Collapse>
                <Collapse.Panel
                  key={"autoSave"}
                  header={"配置文件自动保存设置"}
                >
                  <ConfigItem
                    configContext={configContext}
                    type={"boolean"}
                    name={"退出时"}
                    description={<div>退出应用时自动保存配置文件</div>}
                    valueKey={"autoSaveOnQuit"}
                  />

                  <ConfigItem
                    configContext={configContext}
                    type={"boolean"}
                    name={"更改时"}
                    description={<div>每次更改设置时自动保存配置文件</div>}
                    valueKey={"autoSaveOnChange"}
                  />
                </Collapse.Panel>
                <Collapse.Panel key={"advanced"} header={"高级"}>
                  <ConfigItem
                    configContext={configContext}
                    type={"number"}
                    name={"HTTP服务器监听端口"}
                    description={
                      <div>
                        用于 其他应用查看弹幕, 直播间连接状态更新,
                        动态配置文件更新
                        <br />
                        仅当端口冲突时需要修改(当提示: 已断开服务器连接 或
                        服务器连接发生错误)
                      </div>
                    }
                    valueKey={"httpServerPort"}
                    min={0}
                  />

                  <Alert
                    type={"warning"}
                    message={"修改后需要重启应用才能生效"}
                  />
                </Collapse.Panel>
              </Collapse>
            </div>
          );
        }}
      </ConfigContext.Consumer>
    );
  }
}
