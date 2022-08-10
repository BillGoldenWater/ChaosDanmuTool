<!--
  - Copyright 2021-2022 Golden_Water
  - SPDX-License-Identifier: AGPL-3.0-only
  -->
<script lang="ts">
  import type { TSiderItem } from "./TSiderItem";
  import SiderItem from "./SiderItem.svelte";
  import { spring } from "svelte/motion";
  import type { Spring } from "svelte/motion";

  export let items: TSiderItem[] = [];
  export let selected: string = items[0]?.key ?? "";
  let pointer: HTMLDivElement;
  let pointerLeft = 0;
  let pointerTop: Spring<number> = spring(0, {
    stiffness: 0.1,
    damping: 0.35,
  });

  $: {
    // update pointer
    let item = items.find((value) => value.key == selected);
    let element = item.element;

    if (element && pointer) {
      let heightMid = element.offsetTop + element.clientHeight / 2;
      $pointerTop = heightMid - pointer.clientHeight / 2;
      pointerLeft = element.offsetLeft - pointer.clientWidth / 2;
    }
  }
</script>

<div class="sider">
  {#each items as item}
    <SiderItem
      bind:item
      on:click={() => (selected = item.key)}
      selected={item.key === selected}
    />
  {/each}
  <!--suppress CheckEmptyScriptTag -->
  <div
    bind:this={pointer}
    class="pointer"
    style="top: {$pointerTop}px; left: {pointerLeft}px;"
  />
</div>

<style lang="less">
  .sider {
    height: calc(100vh - var(--spacerWidth) * 2);

    margin: var(--spacerWidthHalf);
    padding: var(--spacerWidthQuarter);

    border-radius: var(--contentBorderRadius);

    background-color: var(--up);

    user-select: none;
  }

  .pointer {
    position: absolute;

    height: 1.25rem;
    width: 0.3rem;

    border-radius: 0.15rem;

    background-color: var(--themeSolid);
  }
</style>
