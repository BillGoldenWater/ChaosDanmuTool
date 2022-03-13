/*
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { ReactNode } from "react";
import { Card, Divider, message, Skeleton, Tooltip, Typography } from "antd";
import MarkdownIt from "markdown-it";
import Link from "antd/lib/typography/Link";

const { Title, Paragraph } = Typography;

class Props {
  checkUpdate: (whenDone: () => void) => void;
}

class State {
  changeLog: string;
}

export class About extends React.Component<Props, State> {
  markdownIt: MarkdownIt;

  constructor(props: Props) {
    super(props);

    this.state = {
      changeLog: "",
    };

    this.markdownIt = new MarkdownIt();

    window.electron.getChangeLog().then((changeLog) => {
      this.setState({
        changeLog,
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

    let changelog: ReactNode;
    if (s.changeLog != "") {
      changelog = (
        <Card>
          <div
            dangerouslySetInnerHTML={{
              __html: this.markdownIt.render(s.changeLog),
            }}
          />
        </Card>
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
            Chaos Danmu Tool {version}-{platform}
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
          <Divider orientation="left">更新记录</Divider>
          {changelog}
        </Typography>
      </div>
    );
  }
}
