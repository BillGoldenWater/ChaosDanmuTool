<!--
  - Copyright 2021-2022 Golden_Water
  - SPDX-License-Identifier: AGPL-3.0-only
  -->
<script lang="ts">
  import Icon from "svelte-icons-pack/Icon.svelte";

  import VscCircleLargeFill from "svelte-icons-pack/vsc/VscCircleLargeFill";
  import { createEventDispatcher } from "svelte";

  export let icon: unknown = VscCircleLargeFill;
  export let name: string = "Name";
  export let description: string = "Description";

  // region event
  const dispatch = createEventDispatcher();

  function onClick() {
    dispatch("click");
  }

  // endregion
</script>

<div class="functionItem" on:click={onClick}>
  <div class="icon">
    <Icon src={icon} size="3em" />
  </div>
  <div class="info">
    <div class="name">{name}</div>
    <div class="description">{description}</div>
  </div>
</div>

<style lang="less">
  .functionItem {
    transition: background-color 0.2s ease-out;

    flex-grow: 1;

    display: flex;

    padding: var(--spacerWidthHalf);
    margin: var(--spacerWidthHalf);

    border-radius: var(--itemBorderRadius);

    background-color: var(--up);

    user-select: none;
    -webkit-user-select: none;

    &:hover {
      background-color: var(--upDouble);
    }

    &:active {
      background-color: var(--down);
    }
  }

  .icon {
    display: flex;
  }

  .info {
    margin-left: var(--spacerWidth);
  }

  .name {
    margin-bottom: var(--spacerWidthQuarter);
  }

  .description {
    font-size: var(--secondaryTextSize);
    color: var(--secondaryText);
  }
</style>
