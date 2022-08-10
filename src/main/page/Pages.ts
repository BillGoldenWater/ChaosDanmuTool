/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { PageManager } from "../../share/manager/PageManager";
import VscDashboard from "svelte-icons-pack/vsc/VscDashboard";
import VscTools from "svelte-icons-pack/vsc/VscTools";
import VscHistory from "svelte-icons-pack/vsc/VscHistory";
import VscSettingsGear from "svelte-icons-pack/vsc/VscSettingsGear";
import VscInfo from "svelte-icons-pack/vsc/VscInfo";
import Functions from "./functions/Functions.svelte";

export const pages = new PageManager([
  { id: "overview", icon: VscDashboard, name: "总览" },
  { id: "function", icon: VscTools, name: "功能", component: Functions },
  { id: "history", icon: VscHistory, name: "历史记录" },
  { id: "setting", icon: VscSettingsGear, name: "设置" },
  { id: "about", icon: VscInfo, name: "关于" },
]);
