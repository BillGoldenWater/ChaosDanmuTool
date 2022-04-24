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
  MainEventTarget,
  NewMessageEvent,
} from "../../rendererShare/event/MainEventTarget";
import { TCommandPack } from "../../share/type/commandPack/TCommandPack";
import { WebSocketClient } from "../../share/network/client/WebSocketClient";
import { getProperty, setProperty } from "dot-prop";
import { TAnyAppCommand } from "../../share/type/commandPack/appCommand/TAnyAppCommand";
import { functionPagePathKey } from "./page/function/Function";

class Props {}

export class App extends React.Component<Props, MainState> {
  eventTarget: MainEventTarget = new MainEventTarget();
  webSocketClient: WebSocketClient = new WebSocketClient();

  constructor(props: Props) {
    super(props);

    const cfg = window.electron.getConfig();
    this.state = {
      config: cfg,

      path: this.getPath(cfg.path),
    };

    toggleDarkMode(cfg.darkTheme);

    this.webSocketClient.updateOption({
      port: cfg.httpServerPort,

      location: "App.webSocketClient",
      onMessage: this.onMessage.bind(this),
    });
    this.webSocketClient.open();
  }

  componentWillUnmount() {
    this.webSocketClient.close();
  }

  getPath(path: string): URL {
    return createPagePath(path, pageList[0].key);
  }

  onMessage(event: MessageEvent): void {
    const commandPack: TCommandPack = JSON.parse(event.data);

    this.eventTarget.dispatchEvent(new NewMessageEvent(commandPack));

    switch (commandPack.data.cmd) {
      case "appCommand": {
        const appCommand: TAnyAppCommand = commandPack.data.data;

        switch (appCommand.cmd) {
          case "configUpdate": {
            this.setState({
              config: appCommand.config,
              path: this.getPath(appCommand.config.path),
            });
          }
        }
      }
    }
  }

  render(): ReactNode {
    const s = this.state;
    const path = s.path;

    const currentPage = pageList
      .find((value) => value.key === path.host)
      ?.render?.() ?? <Content padding>{path.host} 未完成</Content>;

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
