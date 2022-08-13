<!--
  - Copyright 2021-2022 Golden_Water
  - SPDX-License-Identifier: AGPL-3.0-only
  -->
<svelte:options accessors />

<script lang="ts">
  import Content from "../../../share/component/Content.svelte";
  import FunctionItem from "./FunctionItem.svelte";

  import { functionPages } from "./FunctionPages";
  import type { PageInfo } from "../../../share/manager/PageManager";
  import {
    appEnv,
    getPathOption,
    setPathOption,
  } from "../../../share/appEnv/AppEnv";

  let pageId: string;

  // noinspection JSUnusedGlobalSymbols
  export const ret = () => setPathOption("functionPageId", "");

  let pages: PageInfo<unknown>[] = functionPages.getPages();

  $: pageId = getPathOption($appEnv, "functionPageId") || "";
  $: page = functionPages.getPage(pageId);
</script>

{#if pageId === ""}
  <Content paddingType="normal">
    <div class="functions">
      {#each pages as page}
        <FunctionItem
          icon={page.icon}
          name={page.name}
          description={page.description}
          on:click={() => {
            setPathOption("functionPageId", page.id);
          }}
        />
      {/each}
    </div>
  </Content>
{:else if page == null}
  <Content>Unknown function: {pageId}</Content>
{:else if page.component == null}
  <Content>Unfinished function: {pageId}</Content>
{:else}
  <svelte:component this={page.component} />
{/if}

<style>
  .functions {
    display: flex;
    flex-wrap: wrap;
  }
</style>
