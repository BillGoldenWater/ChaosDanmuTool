/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { ReactNode } from "react";
import {
  AppstoreOutlined,
  DashboardOutlined,
  HistoryOutlined,
  InfoCircleOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { Function } from "./function/Function";

export type PageKey =
  | "dashboard"
  | "function"
  | "history"
  | "setting"
  | "about";

export type PageInfo<K extends PageKey> = {
  key: K;
  name: string;
  icon: ReactNode;
  render?: () => ReactNode;
};

export function createPagePath(path: string, defaultPageKey: PageKey): URL {
  const defaultPath = new URL(`https://${defaultPageKey}`);

  try {
    const result = new URL(path);
    if (pageList.find((value) => value.key === result.host) == null)
      return defaultPath;
    return result;
    // eslint-disable-next-line no-empty
  } catch (e) {}

  return defaultPath;
}

export const pageList: PageInfo<PageKey>[] = [
  {
    key: "dashboard",
    name: "总览",
    icon: <DashboardOutlined />,
  },
  {
    key: "function",
    name: "功能",
    icon: <AppstoreOutlined />,
    render: () => <Function />,
  },
  {
    key: "history",
    name: "历史记录",
    icon: <HistoryOutlined />,
  },
  {
    key: "setting",
    name: "设置",
    icon: <SettingOutlined />,
  },
  {
    key: "about",
    name: "关于",
    icon: <InfoCircleOutlined />,
  },
];
