/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { ReactNode } from "react";
import { TGithubRelease } from "../../../../type/github/TGithubRelease";
import { Button, Card, Collapse, message, Modal, Typography } from "antd";
import { ConfigContext } from "../../utils/ConfigContext";
import MarkdownIt from "markdown-it";

class Props {
  githubRelease: TGithubRelease;
  changeLog: string;
}

class State {
  show: boolean;
  redirecting: boolean;
}

export class UpdateInfo extends React.Component<Props, State> {
  markdownIt: MarkdownIt;

  constructor(props: Props) {
    super(props);

    this.state = {
      show: true,
      redirecting: false,
    };

    this.markdownIt = new MarkdownIt();
  }

  render(): ReactNode {
    const p = this.props;
    const s = this.state;

    const platform = window.electron.getPlatform();
    const arch = window.electron.isUnderARM64Translation()
      ? "arm"
      : window.electron.getArch();
    const dlLink =
      p.githubRelease.assets.find(
        (value) => value.name.includes(platform) && value.name.includes(arch)
      )?.browser_download_url ?? "";

    const downloadAvailable = dlLink !== "";

    return (
      <ConfigContext.Consumer>
        {({ set }) => (
          <Modal
            title={"新的版本!"}
            visible={s.show}
            closable={false}
            footer={[
              <Button // copy
                disabled={!downloadAvailable}
                type={"primary"}
                onClick={() => {
                  window.electron.writeClipboard(dlLink);
                  message.success("复制成功").then();
                }}
              >
                复制链接
              </Button>,
              <Button // download
                disabled={true}
                key={"link"}
                href={dlLink}
                loading={s.redirecting}
                onClick={() => {
                  this.setState({ redirecting: true });
                  setTimeout(() => {
                    this.setState({
                      show: false,
                      redirecting: false,
                    });
                  }, 3000);
                }}
              >
                下载
              </Button>,
              <Button // skip
                onClick={() => {
                  this.setState({ show: false });
                  set("update.ignoreVersion", p.githubRelease.tag_name);
                }}
              >
                跳过此版本
              </Button>,
              <Button // close
                onClick={() => {
                  this.setState({ show: false });
                }}
              >
                关闭
              </Button>,
            ]}
          >
            <Typography.Title level={3}>
              {p.githubRelease.name}
            </Typography.Title>
            <Card>
              <div
                dangerouslySetInnerHTML={{
                  __html: this.markdownIt.render(p.githubRelease.body),
                }}
              />
            </Card>
            <Collapse>
              <Collapse.Panel key={"changeLog"} header={"历史更新记录"}>
                <div
                  dangerouslySetInnerHTML={{
                    __html: this.markdownIt.render(p.changeLog),
                  }}
                />
              </Collapse.Panel>
            </Collapse>
          </Modal>
        )}
      </ConfigContext.Consumer>
    );
  }
}
