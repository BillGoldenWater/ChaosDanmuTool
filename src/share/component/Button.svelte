<!--
  - Copyright 2021-2022 Golden_Water
  - SPDX-License-Identifier: AGPL-3.0-only
  -->
<script lang="ts">
  import { createEventDispatcher } from "svelte";

  export let inline: boolean = true;
  export let primary: boolean = false;
  export let disabled: boolean = false;

  // region event
  const dispatch = createEventDispatcher();

  function onClick() {
    if (!disabled) {
      dispatch("click");
    }
  }

  // endregion
</script>

<div
  class="button"
  class:inline
  class:enabled={!disabled}
  class:primary={primary && !disabled}
  class:disabled
  on:click={onClick}
>
  <div class="content">
    <slot>Button</slot>
  </div>
</div>

<style lang="less">
  .button {
    transition: background-color 0.1s ease-out;

    display: flex;
    justify-content: center;
    align-items: center;

    padding: var(--spacerWidthHalf) var(--spacerWidth);

    border-radius: var(--itemBorderRadius);
    
    font-weight: bold;

    user-select: none;
    -webkit-user-select: none;
  }

  .inline {
    display: inline-flex;
  }

  .enabled {
    background-color: var(--up);

    &:hover {
      background-color: var(--upDouble);
    }

    &:active {
      background-color: var(--down);
    }
  }

  .primary {
    background-color: var(--themePrimary);

    &:hover {
      background-color: var(--themePrimaryUp);
    }

    &:active {
      background-color: var(--themePrimaryDown);
    }
  }

  .disabled {
    color: var(--secondaryText);
    background-color: var(--down);
  }

  .content {
    font-size: 14px;
  }
</style>
