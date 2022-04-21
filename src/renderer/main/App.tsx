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
import { createPagePath, PageKey, pageList } from "./page/Page";
import { MenuItem } from "./component/menu/MenuItem";
import { MainState } from "../MainState";
import { ConfigProvider, TConfigContext } from "../ConfigContext";

class Props {}

export class App extends React.Component<Props, MainState> {
  eventTarget = new EventTarget();

  constructor(props: Props) {
    super(props);

    this.state = {
      path: createPagePath("", pageList[0].key),
    };

    toggleDarkMode(true);
  }

  render(): ReactNode {
    const s = this.state;
    const path = s.path;

    const currentPage = pageList
      .find((value) => value.key === path.host)
      ?.render?.() ?? <Content padding>{path.host} 未完成</Content>;

    const configContext: TConfigContext = {
      state: s,
      setState: this.setState,
      eventTarget: this.eventTarget,
    };

    return (
      <ConfigProvider value={configContext}>
        <div>
          <Layout
            sider={
              <Menu
                selectedKey={path.host}
                itemList={pageList.map((v) => (
                  <MenuItem key={v.key} name={v.name} icon={v.icon} />
                ))}
                onSelectNew={(value: PageKey) => {
                  this.setState((prev) => {
                    prev.path.host = value;
                    return { path: prev.path };
                  });
                }}
              />
            }
          >
            {currentPage}
          </Layout>
        </div>
      </ConfigProvider>
    );
  }
}
