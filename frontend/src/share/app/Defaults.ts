/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Config } from "../type/rust/config";
import {
  deserialize_config,
  deserialize_viewer_config,
  get_default_user_info,
} from "chaos_danmu_tool_share";
import { ViewerViewConfig } from "../type/rust/config/frontend_config/viewer_view_config";
import { UserInfo } from "../type/rust/types/user_info";

export const defaultConfig: Config = deserialize_config("{}") as Config;
export const defaultViewerConfig: ViewerViewConfig = deserialize_viewer_config(
  "{}"
) as ViewerViewConfig;
export const defaultUserInfo: UserInfo = get_default_user_info() as UserInfo;
