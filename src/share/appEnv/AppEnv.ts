/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { get, writable } from "svelte/store";
import type { Writable } from "svelte/store";
import type { Config } from "../type/rust/config/Config";
import type { ViewerViewConfig } from "../type/rust/config/frontendConfig/ViewerViewConfig";
import type { ReceiverStatus } from "../type/rust/command/commandPacket/appCommand/receiverStatusUpdate/ReceiverStatus";
import { AppEventTarget } from "../event/AppEventTarget";
import defaultConfig from "../type/rust/config/defaultConfig.json";
import defaultViewerConfig from "../type/rust/config/defaultViewerConfig.json";
import type { ObjectPath } from "../type/TObjectPath";
import { setProperty } from "dot-prop";
import * as uuid from "uuid";

export interface AppEnv {
  config: Config;
  viewerConfig: ViewerViewConfig;

  path: URL;
  receiverStatus: ReceiverStatus;

  eventTarget: AppEventTarget;
}

export const appEnv: Writable<AppEnv> = writable({
  config: null,
  viewerConfig: null,

  path: null,
  receiverStatus: "close",

  eventTarget: new AppEventTarget(),
});
applyConfigUpdateToAppEnv(defaultConfig as Config); // TODO detect backend api and fetch config

// region config
function getViewerUuid(): string | null {
  let url = new URL(window.location.href);
  return url.searchParams.get("uuid");
}

function getViewerConfig(config?: Config): ViewerViewConfig {
  let cfg = config || get(appEnv)?.config;
  if (cfg == null) {
    throw Error("unreachable");
  }
  let viewerView = cfg.frontend.viewerView;

  return (
    viewerView.find((it) => it.uuid === getViewerUuid()) ||
    viewerView.find((it) => it.default) ||
    viewerView[0] ||
    defaultViewerConfig
  );
}

function getConfigAppliedAppEnv(appEnv: AppEnv, config: Config): AppEnv {
  return {
    ...appEnv,
    config: config,
    viewerConfig: getViewerConfig(config),

    path: new URL(config.frontend.mainView.path),
  };
}

export function applyConfigUpdateToAppEnv(config: Config) {
  appEnv.update((previous) => {
    return getConfigAppliedAppEnv(previous, config);
  });
}

function setConfig_(
  appEnv: AppEnv,
  key: ObjectPath<Config>,
  value: unknown
): AppEnv {
  let newConfig = setProperty(appEnv.config, key, value);
  // TODO send config update to backend

  return getConfigAppliedAppEnv(appEnv, newConfig);
}

export function setConfig(key: ObjectPath<Config>, value: unknown) {
  appEnv.update((previous) => {
    return setConfig_(previous, key, value);
  });
}

export function setViewerConfig(
  key: ObjectPath<ViewerViewConfig>,
  value: unknown
) {
  appEnv.update((previous) => {
    if (previous.viewerConfig.uuid === uuid.NIL) {
      return previous;
    }
    if (
      previous.config.frontend.viewerView.find(
        (it) => it.uuid === previous.viewerConfig.uuid
      ) == null
    ) {
      return previous;
    }

    let viewerCfgArr = previous.config.frontend.viewerView;

    let newViewerCfg = setProperty(previous.viewerConfig, key, value);
    let newViewerCfgArr = viewerCfgArr.filter(
      (it) => it.uuid !== newViewerCfg.uuid
    );
    newViewerCfgArr.push(newViewerCfg);

    return setConfig_(previous, "frontend.viewerView", newViewerCfgArr);
  });
}

// endregion

// region path
export function setPathOption(key: string, value: string) {
  appEnv.update((previous) => {
    let newUrl = new URL(previous.path.href);
    newUrl.searchParams.set(key, value);
    return setConfig_(previous, "frontend.mainView.path", newUrl.href);
  });
}

export function getPathOption(appEnv: AppEnv, key: string): string | null {
  return appEnv.path?.searchParams?.get(key);
}

export function pathJump(target: string) {
  appEnv.update((previous) => {
    let newPath = new URL(target, previous.path);
    previous.path.searchParams.forEach((value, key) => {
      newPath.searchParams.set(key, value);
    });
    return setConfig_(previous, "frontend.mainView.path", newPath.href);
  });
}

// endregion
