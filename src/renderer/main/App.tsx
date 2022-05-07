/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { ReactNode } from "react";
import "./App.less";
import { Layout } from "./component/layout/Layout";
import { toggleDarkMode } from "../../rendererShare/style/ThemeUtils";
import { Content } from "./component/content/Content";
import { Menu } from "./component/menu/Menu";
import { createPagePath, PageKey, pageList } from "./page/Page";
import { MenuItem } from "./component/menu/MenuItem";
import { MainState } from "../../rendererShare/state/MainState";
import {
  ConfigP,
  TConfigContext,
} from "../../rendererShare/state/ConfigContext";
import {
  ConfigUpdateEvent,
  MainEventTarget,
} from "../../rendererShare/event/MainEventTarget";
import { CommandReceiver } from "../../share/network/client/CommandReceiver";
import { getProperty, setProperty } from "dot-prop";
import { functionPagePathKey } from "./page/function/Function";

class Props {}

export class App extends React.Component<Props, MainState> {
  eventTarget: MainEventTarget = new MainEventTarget();
  webSocketClient: CommandReceiver = new CommandReceiver();

  constructor(props: Props) {
    super(props);

    const cfg = window.electron.getConfig();
    this.state = {
      config: cfg,

      path: this.getPath(cfg.path),
    };

    toggleDarkMode(cfg.darkTheme);

    this.registerEvents();

    this.webSocketClient.updateOption({
      port: cfg.httpServerPort,

      location: "App.webSocketClient",
      eventTarget: this.eventTarget,
    });
    this.webSocketClient.open();
  }

  componentWillUnmount() {
    this.webSocketClient.close();
  }

  getPath(path: string): URL {
    return createPagePath(path, pageList[0].key);
  }

  registerEvents() {
    const a = this.eventTarget.addEventListener;

    a("configUpdate", this.onConfigUpdate.bind(this));
  }

  onConfigUpdate(event: ConfigUpdateEvent) {
    this.setState({
      config: event.config,
      path: this.getPath(event.config.path),
    });
  }

  render(): ReactNode {
    const s = this.state;
    const path = s.path;

    const currentPage = pageList
      .find((value) => value.key === path.host)
      ?.render?.() ?? <Content>{path.host} 未完成</Content>;

    const configSet: TConfigContext["set"] = (path, value) => {
      this.setState((prevState) => {
        const config = prevState.config;
        setProperty(config, path, value);
        window.electron.updateConfig(config);
      });
    };

    const configContext: TConfigContext = {
      state: s,
      setState: this.setState,
      eventTarget: this.eventTarget,
      get: (path, defaultValue) => {
        return getProperty(s.config, path, defaultValue);
      },
      set: configSet,
      setPathOption: (key, value) => {
        path.searchParams.set(key, value);
        configSet("path", path.toString());
      },
    };

    return (
      <ConfigP value={configContext}>
        <div>
          <Layout
            sider={
              <Menu
                selectedKey={path.host}
                itemList={pageList.map((v) => (
                  <MenuItem key={v.key} name={v.name} icon={v.icon} />
                ))}
                onSelectNew={(value: PageKey) => {
                  this.setState(
                    (prev) => {
                      if (prev.path.host === value && value === "function")
                        prev.path.searchParams.set(functionPagePathKey, "");

                      prev.path.host = value;
                      return { path: prev.path };
                    },
                    () => {
                      configContext.set("path", s.path.toString());
                    }
                  );
                }}
              />
            }
          >
            {currentPage}
          </Layout>
        </div>
      </ConfigP>
    );
  }
}
