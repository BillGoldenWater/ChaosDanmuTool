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
  import { appEnv, getPathOption, setPathOption } from "../share/appEnv/AppEnv";
  import { CommandReceiver } from "../share/network/CommandReceiver";

  // region commandReceiver
  let commandReceiver = new CommandReceiver({
    location: "Main.App.commandReceiver",
    eventTarget: $appEnv.eventTarget,
    debug: true,
  });

  $: commandReceiver.updateOption({
    port: $appEnv.config.backend.httpServer.port,
  });

  commandReceiver.open();
  // endregion

  let siderItems: TSiderItem[] = pages.getPages().map((it) => ({
    key: it.id,
    icon: it.icon,
  }));

  $: currentPageId =
    getPathOption($appEnv, "pageId") || pages.getPages()[0]?.id || "";
  $: currentPage = pages.getPage(currentPageId);

  let pageInstance: { ret: () => void };
</script>

<div class="app">
  <ThemeAnimate />
  <Layout>
    <div slot="sider">
      <Sider
        items={siderItems}
        selected={currentPageId}
        on:change={(event) => {
          let key = event.detail;
          if (key === currentPageId) {
            pageInstance?.ret && pageInstance.ret();
          }
          setPathOption("pageId", event.detail);
        }}
      />
    </div>
    <div slot="content">
      {#if currentPage == null}
        <Content>Unknown page: {currentPageId}</Content>
      {:else if currentPage.component == null}
        <Content>Unfinished page: {currentPageId}</Content>
      {:else}
        <svelte:component
          this={currentPage.component}
          bind:this={pageInstance}
        />
      {/if}
    </div>
  </Layout>
</div>

<style>
  .app {
    height: 100vh;
    width: 100vw;

    overflow: hidden;

    background-color: var(--background);
    color: var(--text);
    padding: var(--spacerWidthHalf);
  }
</style>
