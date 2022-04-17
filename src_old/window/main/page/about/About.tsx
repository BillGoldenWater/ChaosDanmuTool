/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { ReactNode } from "react";
import {
  Button,
  Card,
  Divider,
  message,
  notification,
  Skeleton,
  Tooltip,
  Typography,
} from "antd";
import MarkdownIt from "markdown-it";
import Link from "antd/lib/typography/Link";
import { ResultStatus } from "../../../../type/TResultStatus";

const { Title, Paragraph } = Typography;

enum Status {
  FailedToLoad = "&{FailedToLoad}&",
}

class Props {
  checkUpdate: (whenDone: () => void) => void;
}

class State {
  changeLog: string;
  gettingChangeLog: boolean;
}

export class About extends React.Component<Props, State> {
  markdownIt: MarkdownIt;

  constructor(props: Props) {
    super(props);

    this.state = {
      changeLog: "",
      gettingChangeLog: false,
    };

    this.markdownIt = new MarkdownIt();

    this.updateChangeLog();
  }

  updateChangeLog(fromUser?: boolean) {
    window.electron.getChangeLog().then((changeLogRes) => {
      if (changeLogRes.status != ResultStatus.Success) {
        if (fromUser) {
          notification.error({
            message: "获取更新日志失败",
            description: changeLogRes.message,
          });
        }
        this.setState({
          changeLog: Status.FailedToLoad,
        });
        return;
      }

      this.setState({
        changeLog: changeLogRes.result,
      });
    });
  }

  render(): ReactNode {
    const p = this.props;
    const s = this.state;

    const version = (
      <Tooltip title={"检查更新"}>
        <Link
          onClick={() => {
            p.checkUpdate(message.loading("检查更新中"));
          }}
        >
          {window.electron.getVersion()}
        </Link>
      </Tooltip>
    );
    const platform = window.electron.getPlatform();
    const arch = window.electron.getArch();

    let changelog: ReactNode;

    if (s.changeLog != "" && s.changeLog != Status.FailedToLoad) {
      changelog = (
        <Card>
          <div
            dangerouslySetInnerHTML={{
              __html: this.markdownIt.render(s.changeLog),
            }}
          />
        </Card>
      );
    } else if (s.changeLog == Status.FailedToLoad) {
      changelog = (
        <Button
          loading={s.gettingChangeLog}
          onClick={() => {
            this.setState({
              gettingChangeLog: true,
            });
            this.updateChangeLog(true);
          }}
        >
          重新加载
        </Button>
      );
    } else {
      changelog = [
        <Skeleton active key={"1"} />,
        <Skeleton active key={"2"} />,
        <Skeleton active key={"3"} />,
      ];
    }

    return (
      <div>
        <Typography>
          <Title level={3}>
            Chaos Danmu Tool {version}-{platform}-{arch}
          </Title>
          <Divider />
          <Paragraph
            copyable={{
              text: "442025553",
            }}
          >
            交流群: QQ442025553
          </Paragraph>
          <Paragraph
            copyable={{
              text: "https://github.com/BiliGoldenWater/ChaosDanmuTool",
            }}
          >
            Github 存储库主页: github.com/BiliGoldenWater/ChaosDanmuTool
          </Paragraph>
          <Paragraph>
            Copyright 2021-2022 Golden_Water
            <br />
            许可协议: GNU Affero General Public License Version 3
          </Paragraph>
          <Divider orientation="left">更新记录</Divider>
          {changelog}
        </Typography>
      </div>
    );
  }
}
