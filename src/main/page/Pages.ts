/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { PageManager } from "../../share/manager/PageManager";
import VscDashboard from "svelte-icons-pack/vsc/VscDashboard";
import VscMenu from "svelte-icons-pack/vsc/VscMenu";
import VscHistory from "svelte-icons-pack/vsc/VscHistory";
import VscSettingsGear from "svelte-icons-pack/vsc/VscSettingsGear";
import VscInfo from "svelte-icons-pack/vsc/VscInfo";

export const pages = new PageManager([
  { id: "overview", icon: VscDashboard },
  { id: "function", icon: VscMenu },
  { id: "history", icon: VscHistory },
  { id: "setting", icon: VscSettingsGear },
  { id: "about", icon: VscInfo },
]);
