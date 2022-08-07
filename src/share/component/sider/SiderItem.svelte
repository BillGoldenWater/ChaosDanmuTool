<!--
  - Copyright 2021-2022 Golden_Water
  - SPDX-License-Identifier: AGPL-3.0-only
  -->
<script lang="ts">
  import type { TSiderItem } from "./TSiderItem";

  import Icon from "svelte-icons-pack/Icon.svelte";
  import VscCircleLargeFill from "svelte-icons-pack/vsc/VscCircleLargeFill";

  export let item: TSiderItem = { key: "default", icon: VscCircleLargeFill };
  export let selected: boolean = false;

  // region event
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  function onClick() {
    dispatch("click");
  }

  // endregion
</script>

<div
  class="item"
  class:itemSelected={selected}
  bind:this={item.element}
  on:click={onClick}
>
  <Icon src={item.icon} size="1.35em" />
</div>

<style lang="less">
  .item {
    transition: all 100ms ease-out;

    display: flex;

    padding: var(--spacerWidthHalf);
    margin: var(--spacerWidthHalf) var(--spacerWidthQuarter);

    border-radius: var(--itemBorderRadius);

    color: var(--text);
    background-color: var(--up);

    &:hover {
      background-color: var(--upDouble);
    }

    &:active {
      background-color: var(--down);
    }
  }

  .itemSelected {
    color: var(--themeText);
    background-color: var(--theme);

    &:hover {
      background-color: var(--themeDouble);
    }

    &:active {
      background-color: var(--themeDown);
    }
  }
</style>
