/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { ReactNode } from "react";
import "./App.less";
import { Layout } from "./component/layout/Layout";
import { toggleDarkMode } from "./utils/ThemeUtils";
import { Content } from "./component/content/Content";
import { Menu } from "./component/menu/Menu";
import { MenuItem } from "./component/menu/MenuItem";
import {
  AppstoreOutlined,
  DashboardOutlined,
  HistoryOutlined,
  InfoCircleOutlined,
  SettingOutlined,
} from "@ant-design/icons";

class Props {}

class State {
  selected: string;
}

export class App extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      selected: "dashboard",
    };

    toggleDarkMode(false);
  }

  render(): ReactNode {
    return (
      <div>
        <Layout
          sider={
            <Menu
              selectedKey={this.state.selected}
              itemList={[
                <MenuItem key={"dashboard"} icon={<DashboardOutlined />} />,
                <MenuItem key={"function"} icon={<AppstoreOutlined />} />,
                <MenuItem key={"history"} icon={<HistoryOutlined />} />,
                <MenuItem key={"setting"} icon={<SettingOutlined />} />,
                <MenuItem key={"about"} icon={<InfoCircleOutlined />} />,
              ]}
              onSelectNew={(value) => {
                this.setState({ selected: value });
              }}
            />
          }
        >
          <Content padding>App</Content>
        </Layout>
      </div>
    );
  }
}
