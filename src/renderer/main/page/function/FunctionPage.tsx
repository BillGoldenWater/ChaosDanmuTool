/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { ReactNode } from "react";
import { ApiOutlined, CompassOutlined, EyeOutlined } from "@ant-design/icons";
import { ConnectRoom } from "./connectRoom/ConnectRoom";
import { DanmuViewer } from "./danmuViewer/DanmuViewer";

export type FunctionPageKey = "" | "connectRoom" | "danmuViewer" | "gacha";

export type FunctionPageInfo<K extends FunctionPageKey> = {
  key: K;
  name: string;
  description: string;
  icon: ReactNode;
  render?: () => ReactNode;
};

export const functionPageList: FunctionPageInfo<FunctionPageKey>[] = [
  {
    key: "connectRoom",
    name: "连接直播间",
    description: "管理与直播间的连接",
    icon: <ApiOutlined />,
    render: () => <ConnectRoom />,
  },
  {
    key: "danmuViewer",
    name: "查看弹幕",
    description: "弹幕悬浮窗开关, 使用说明, 获取链接, 调整样式",
    icon: <EyeOutlined />,
  },
  {
    key: "gacha",
    name: "弹幕抽奖",
    description: `"随机抽取一位幸运观众, 赠送一个......"`,
    icon: <CompassOutlined spin />,
  },
];
