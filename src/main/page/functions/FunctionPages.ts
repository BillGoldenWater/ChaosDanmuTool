/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { PageManager } from "../../../share/manager/PageManager";
import VscDashboard from "svelte-icons-pack/vsc/VscServer";
import VscPreview from "svelte-icons-pack/vsc/VscPreview";
import VscSymbolMisc from "svelte-icons-pack/vsc/VscSymbolMisc";

export const functionPages = new PageManager([
  {
    id: "connectRoom",
    icon: VscDashboard,
    name: "连接直播间",
    description: "管理与直播间的连接",
  },
  {
    id: "viewerManager",
    icon: VscPreview,
    name: "查看器管理",
    description: "弹幕悬浮窗开关, 使用说明, 获取链接, 调整样式",
  },
  {
    id: "gacha",
    icon: VscSymbolMisc,
    name: "抽奖",
    description: `"随机抽取一位幸运观众, 赠送一个......"`,
  },
]);
