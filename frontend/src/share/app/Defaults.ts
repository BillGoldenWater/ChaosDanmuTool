/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Config } from "../type/rust/config/Config";
import defaultConfigSource from "../type/rust/config/defaultConfig.json";
import { ViewerViewConfig } from "../type/rust/config/frontendConfig/ViewerViewConfig";
import defaultViewerConfigSource from "../type/rust/config/defaultViewerConfig.json";
import { UserInfo } from "../type/rust/cache/userInfo/UserInfo";
import defaultUserInfoSource from "../type/rust/cache/userInfo/defaultUserInfo.json";

export const defaultConfig: Config = defaultConfigSource as Config;
export const defaultViewerConfig: ViewerViewConfig =
  defaultViewerConfigSource as ViewerViewConfig;
export const defaultUserInfo: UserInfo = defaultUserInfoSource as UserInfo;
