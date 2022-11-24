/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { ReactNode } from "react";
import {
  AppEventTarget,
  ConfigUpdateEvent,
  GiftConfigUpdateEvent,
  ReceiverStatusUpdateEvent,
  UserInfoUpdateEvent,
  ViewerStatusUpdateEvent,
} from "./share/event/AppEventTarget";
import { Config } from "./share/type/rust/config/Config";
import {
  AppCtxProvider,
  defaultConfig,
  defaultViewerConfig,
  getParams,
  TAppCtx,
  TAppParams,
} from "./share/app/AppCtx";
import { getProp, setProp } from "./share/utils/DotPropUtils";
import { TObjectKey } from "./share/type/TObjectKey";
import { TGetType } from "./share/type/TGetType";
import { ViewerViewConfig } from "./share/type/rust/config/frontendConfig/ViewerViewConfig";
import { AppPath } from "./share/app/AppPath";
import { TGiftConfig } from "./share/type/TGiftConfig";
import { ReceiverStatus } from "./share/type/rust/command/commandPacket/appCommand/receiverStatusUpdate/ReceiverStatus";
import { ViewerStatus } from "./share/type/rust/command/commandPacket/appCommand/viewerStatusUpdate/ViewerStatus";
import { backend } from "./share/app/BackendApi";
import { pages, TPage } from "./page/Page";
import { TUserInfoCache } from "./share/type/TUserInfoCache";
import { CommandReceiver } from "./share/app/CommandReceiver";

interface Props {
  debug: boolean;
  firstConfig: Config;
}

interface State {
  params: TAppParams;

  config: Config;

  giftConfig: TGiftConfig;
  receiverStatus: ReceiverStatus;
  viewerStatus: ViewerStatus;
  userInfoCache: TUserInfoCache;
}

export class App extends React.Component<Props, State> {
  eventTarget = new AppEventTarget();
  receiver = new CommandReceiver({
    eventTarget: this.eventTarget,
    location: "App",
  });

  // region life cycle
  constructor(props: Props) {
    super(props);

    this.state = {
      params: getParams(),

      config: props.firstConfig,

      giftConfig: new Map(),
      receiverStatus: "close",
      viewerStatus: "close",
      userInfoCache: new Map(),
    };
    let backendCfg = this.state.config.backend;
    this.receiver.updateOption({
      port: backendCfg.httpServer.port,
      debug: props.debug,
    });

    if (this.state.params.pageId == "viewer") {
      this.receiver.updateOption({ host: window.location.hostname });
    }

    this.registerListeners();
    this.receiver.open();
  }

  componentWillUnmount() {
    this.unregisterListeners();
    this.receiver.close();
  }

  render(): ReactNode {
    let ctx: TAppCtx = {
      params: this.state.params,
      setViewerId: this.setViewerId.bind(this),

      config: {
        get: this.configGet.bind(this),
        set: this.configSet.bind(this),
      },
      viewerConfig: {
        get: this.viewerConfigGet.bind(this),
        set: this.viewerConfigSet.bind(this),
      },
      path: {
        get: this.pathGet.bind(this),
        set: this.pathSet.bind(this),
      },

      giftConfig: this.state.giftConfig,
      receiverStatus: this.state.receiverStatus,
      viewerStatus: this.state.viewerStatus,
      userInfoCache: this.state.userInfoCache,

      eventTarget: this.eventTarget,
    };

    let page = pages.find((it) => it.pageId == ctx.params.pageId) as TPage;

    return <AppCtxProvider value={ctx}>{page.page()}</AppCtxProvider>;
  }

  // endregion

  // region ctx
  // region config
  async setConfig(config: Config, save: boolean = false) {
    if (save) {
      if (backend) {
        await backend.updateConfig(config);
      }
    }
    this.setState((prev) => ({ ...prev, config }));
  }

  configGet<K extends TObjectKey<Config>, V extends TGetType<Config, K>>(
    key: K,
    defaultValue?: V
  ): V {
    return getProp(this.state.config, key, defaultValue);
  }

  async configSet<K extends TObjectKey<Config>, V extends TGetType<Config, K>>(
    key: K,
    value: V
  ) {
    let newCfg = this.state.config;
    setProp(newCfg, key, value);
    await this.setConfig(newCfg, true);
  }

  // endregion

  // region viewerConfig
  getViewerConfig(): ViewerViewConfig {
    let result = this.state.config.frontend.viewerView.find(
      (it) => it.uuid === this.state.params.viewerId
    );
    if (result == null) {
      result = this.state.config.frontend.viewerView.find(
        (it) => it.uuid === defaultConfig.frontend.viewerView[0].uuid
      );
      console.error("fallback to default internal viewerConfig");
    }
    if (result == null) {
      console.error("fallback to defaultViewerConfig");
      result = defaultViewerConfig;
    }
    return result;
  }

  viewerConfigGet<
    K extends TObjectKey<ViewerViewConfig>,
    V extends TGetType<ViewerViewConfig, K>
  >(key: K, defaultValue?: V): V {
    return getProp(this.getViewerConfig(), key, defaultValue);
  }

  async viewerConfigSet<
    K extends TObjectKey<ViewerViewConfig>,
    V extends TGetType<ViewerViewConfig, K>
  >(key: K, value: V) {
    setProp(this.getViewerConfig(), key, value);
    await this.setConfig(this.state.config, true);
  }

  // endregion

  // region path
  getPath(): AppPath {
    return new AppPath(this.state.config);
  }

  pathGet<T>(key: string, defaultValue?: T): T | undefined {
    return this.getPath().get(key, defaultValue);
  }

  async pathSet<T>(key: string, value: T): Promise<void> {
    let path = this.getPath();
    path.set(key, value);

    await this.configSet("frontend.mainView.path", path.toString());
  }

  // endregion

  setViewerId(viewerId: string) {
    this.setState((prev) => ({
      ...prev,
      params: { ...prev.params, viewerId },
    }));
  }

  // endregion

  // region event
  // region app command
  async onConfigUpdate(event: ConfigUpdateEvent) {
    await this.setConfig(event.config, false);
  }

  onGiftConfigUpdate(event: GiftConfigUpdateEvent) {
    this.setState((prev) => ({ ...prev, giftConfig: event.giftConfig }));
  }

  onReceiverStatusUpdate(event: ReceiverStatusUpdateEvent) {
    this.setState((prev) => ({ ...prev, receiverStatus: event.status }));
  }

  onUserInfoUpdate(event: UserInfoUpdateEvent) {
    this.setState((prev) => {
      let newUserInfo = prev.userInfoCache;
      newUserInfo.set(event.userInfo.uid, event.userInfo);
      console.log(newUserInfo);
      return { ...prev, userInfoCache: newUserInfo };
    });
  }

  onViewerStatusUpdate(event: ViewerStatusUpdateEvent) {
    this.setState((prev) => ({ ...prev, viewerStatus: event.status }));
  }

  // endregion

  registerListeners() {
    this.eventTarget.addEventListener(
      "configUpdate",
      this.onConfigUpdate.bind(this)
    );
    this.eventTarget.addEventListener(
      "giftConfigUpdate",
      this.onGiftConfigUpdate.bind(this)
    );
    this.eventTarget.addEventListener(
      "receiverStatusUpdate",
      this.onReceiverStatusUpdate.bind(this)
    );
    this.eventTarget.addEventListener(
      "userInfoUpdate",
      this.onUserInfoUpdate.bind(this)
    );
    this.eventTarget.addEventListener(
      "viewerStatusUpdate",
      this.onViewerStatusUpdate.bind(this)
    );
  }

  unregisterListeners() {
    this.eventTarget.removeEventListener(
      "configUpdate",
      this.onConfigUpdate.bind(this)
    );
    this.eventTarget.removeEventListener(
      "giftConfigUpdate",
      this.onGiftConfigUpdate.bind(this)
    );
    this.eventTarget.removeEventListener(
      "receiverStatusUpdate",
      this.onReceiverStatusUpdate.bind(this)
    );
    this.eventTarget.removeEventListener(
      "userInfoUpdate",
      this.onUserInfoUpdate.bind(this)
    );
    this.eventTarget.removeEventListener(
      "viewerStatusUpdate",
      this.onViewerStatusUpdate.bind(this)
    );
  }

  // endregion
}
