<!--
  - Copyright 2021-2022 Golden_Water
  - SPDX-License-Identifier: AGPL-3.0-only
  -->
<script lang="ts">
  import Layout from "../share/component/Layout.svelte";
  import Sider from "../share/component/sider/Sider.svelte";
  import type { TSiderItem } from "../share/component/sider/TSiderItem";
  import ThemeAnimate from "../share/component/ThemeAnimate.svelte";
  import { pages } from "./page/Pages";
  import Content from "../share/component/Content.svelte";

  let siderItems: TSiderItem[] = pages.getPages().map((it) => ({
    key: it.id,
    icon: it.icon,
  }));

  let currentPageId: string = pages.getPages()[0]?.id || "";
  $: currentPage = pages.getPage(currentPageId);
</script>

<div class="app">
  <ThemeAnimate />
  <Layout>
    <div slot="sider">
      <Sider items={siderItems} bind:selected={currentPageId} />
    </div>
    <div slot="content">
      {#if currentPage == null}
        <Content>Unknown page: {currentPageId}</Content>
      {:else if currentPage.component == null}
        <Content>Unfinished page: {currentPageId}</Content>
      {:else}
        <svelte:component this={currentPage.component} />
      {/if}
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
