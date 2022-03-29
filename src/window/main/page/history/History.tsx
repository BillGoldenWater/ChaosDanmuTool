/*
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from "react";
import "./History.less";
import { Divider } from "antd";
import { DanmuAnalysis } from "../../component/danmuanalysis/DanmuAnalysis";
import { MessageLog } from "../../../../command/messagelog/MessageLog";
import { TAnyMessage } from "../../../../type/TAnyMessage";
import { ConfigItem } from "../../../../component/configitem/ConfigItem";
import { HistoryBrowser } from "./HistoryBrowser";

class Props {}

export class HistoryState {
  selectFile: string;
  files: string[];
  commandHistory: MessageLog<TAnyMessage>[];
  mergePer: number;
  autoReload: boolean;
}

export class History extends React.Component<Props, HistoryState> {
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
        this.resetSelectedFile();
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
        <HistoryBrowser
          state={s}
          setState={this.setState.bind(this)}
          resetSelectedFile={this.resetSelectedFile.bind(this)}
        />
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
}
