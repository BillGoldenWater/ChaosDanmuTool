<!--
  - Copyright 2021-2022 Golden_Water
  - SPDX-License-Identifier: AGPL-3.0-only
  -->
<script lang="ts">
  import Layout from "../share/component/Layout.svelte";
  import Content from "../share/component/Content.svelte";
  import Sider from "../share/component/sider/Sider.svelte";
  import VscDashboard from "svelte-icons-pack/vsc/VscDashboard";
  import VscMenu from "svelte-icons-pack/vsc/VscMenu";
  import VscHistory from "svelte-icons-pack/vsc/VscHistory";
  import VscSettingsGear from "svelte-icons-pack/vsc/VscSettingsGear";
  import VscInfo from "svelte-icons-pack/vsc/VscInfo";
  import type { TSiderItem } from "../share/component/sider/TSiderItem";

  let siderItems: TSiderItem[] = [
    { key: "overview", icon: VscDashboard },
    { key: "function", icon: VscMenu },
    { key: "history", icon: VscHistory },
    { key: "setting", icon: VscSettingsGear },
    { key: "about", icon: VscInfo },
  ];
</script>

<div class="app">
  <Layout>
    <div slot="sider">
      <Sider items={siderItems} />
    </div>
    <div slot="content">
      <Content>Content</Content>
    </div>
  </Layout>
</div>

<style>
  .app {
    height: 100vh;
    width: 100vw;

    overflow: auto;

    background-color: var(--background);
    color: var(--text);
    padding: var(--spacerWidthHalf);
  }
</style>
