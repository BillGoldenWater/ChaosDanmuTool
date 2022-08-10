<!--
  - Copyright 2021-2022 Golden_Water
  - SPDX-License-Identifier: AGPL-3.0-only
  -->
<script lang="ts">
  import Content from "../../../share/component/Content.svelte";
  import FunctionItem from "./FunctionItem.svelte";

  import { functionPages } from "./FunctionPages";
  import type { PageInfo } from "../../../share/manager/PageManager";

  let pages: PageInfo<unknown>[] = functionPages.getPages();
</script>

<Content>
  <div class="functions">
    {#each pages as page}
      <FunctionItem
        icon={page.icon}
        name={page.name}
        description={page.description}
        on:click={() => {
          console.log(page.id);
        }}
      />
    {/each}
  </div>
</Content>

<style>
  .functions {
    display: flex;
    flex-wrap: wrap;
  }
</style>
