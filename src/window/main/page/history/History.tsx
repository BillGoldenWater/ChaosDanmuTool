/*
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from "react";
import "./History.less";
import { Button, Divider, List, Popconfirm, Tooltip, Typography } from "antd";
import {
  DeleteOutlined,
  FolderOpenOutlined,
  ReloadOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import { DanmuAnalysis } from "../../component/danmuanalysis/DanmuAnalysis";
import { MessageLog } from "../../../../command/messagelog/MessageLog";
import { TAnyMessage } from "../../../../type/TAnyMessage";
import { ConfigItem } from "../../../../component/configitem/ConfigItem";

class Props {}

class State {
  selectFile: string;
  files: string[];
  commandHistory: MessageLog<TAnyMessage>[];
  mergePer: number;
  autoReload: boolean;
}

export class History extends React.Component<Props, State> {
  autoReloadTimerId: number;

  constructor(props: Props) {
    super(props);

    const files = window.electron.getCommandHistoryFiles().reverse();
    const latestFile = files.length > 0 ? files[0] : undefined;

    this.state = {
      selectFile: latestFile || "",
      files: files,
      commandHistory: [],
      mergePer: 30,
      autoReload: false,
    };

    this.reloadFile(latestFile);
  }

  resetSelectedFile() {
    const files = window.electron.getCommandHistoryFiles().reverse();
    const latestFile = files.length > 0 ? files[0] : undefined;

    this.setState({
      selectFile: latestFile || "",
      files: files,
    });

    this.reloadFile(latestFile);
  }

  reloadFile(fileName?: string) {
    window.electron.getCommandHistory(fileName).then((value) => {
      this.setState({
        commandHistory: value,
      });
    });
  }

  componentDidUpdate() {
    if (this.state.autoReload) {
      window.clearInterval(this.autoReloadTimerId);
      this.autoReloadTimerId = window.setInterval(() => {
        this.reloadFile();
      }, 1900);
    } else {
      window.clearInterval(this.autoReloadTimerId);
    }
  }

  componentWillUnmount() {
    window.clearInterval(this.autoReloadTimerId);
  }

  render() {
    const s = this.state;

    return (
      <div className={"main_content_without_padding"}>
        <div className={"HistoryBrowser"}>
          <List
            bordered
            size={"small"}
            dataSource={s.files}
            style={{
              overflow: "auto",
            }}
            header={[
              <Button
                key={"reload"}
                icon={<ReloadOutlined />}
                onClick={() => {
                  this.resetSelectedFile();
                }}
              />,
              <Tooltip key={"autoReload"} title={"自动更新 间隔2秒"}>
                <Button
                  icon={<SyncOutlined spin={s.autoReload} />}
                  onClick={() => {
                    this.setState((prevState) => ({
                      autoReload: !prevState.autoReload,
                    }));
                  }}
                />
              </Tooltip>,
              <Popconfirm
                key={"delete"}
                disabled={s.selectFile === ""}
                title={`确定要删除 ${this.getNameOnly(
                  s.selectFile
                )} 吗, 不可撤销`}
                onConfirm={() => {
                  window.electron.deleteCommandHistoryFile(s.selectFile);
                  this.resetSelectedFile();
                }}
              >
                <Button
                  disabled={s.selectFile === ""}
                  icon={<DeleteOutlined />}
                />
              </Popconfirm>,
              <Tooltip
                title={`在 ${
                  window.electron.getPlatform() === "darwin"
                    ? "Finder"
                    : "文件管理器"
                } 中打开`}
              >
                <Button
                  icon={<FolderOpenOutlined />}
                  disabled={s.selectFile === ""}
                  onClick={() => {
                    window.electron.showCommandHistoryFolder(s.selectFile);
                  }}
                />
              </Tooltip>,
            ]}
            renderItem={(item) => (
              <List.Item
                onClick={() => {
                  this.setState({
                    selectFile: item,
                  });
                  window.electron.getCommandHistory(item).then((value) => {
                    this.setState({
                      commandHistory: value,
                    });
                  });
                }}
                style={{ userSelect: "none" }}
              >
                <Typography.Text strong={s.selectFile === item}>
                  {this.getNameOnly(item)}
                </Typography.Text>
              </List.Item>
            )}
          />
        </div>
        <div className={"DanmuAnalysis"}>
          <ConfigItem
            type={"number"}
            value={s.mergePer}
            setNumber={(value) => {
              this.setState({
                mergePer: value,
              });
            }}
            name={"合并间隔"}
            min={1}
            description={
              <div>
                合并一段时间内的数据
                <br />
                单位:秒
              </div>
            }
          />
          <Divider />
          <DanmuAnalysis
            mergePer={s.mergePer}
            danmuHistory={s.commandHistory}
          />
        </div>
      </div>
    );
  }

  getNameOnly(fileName: string) {
    return fileName.replace(".cdtch", "").replace(/-0$/, "");
  }
}
