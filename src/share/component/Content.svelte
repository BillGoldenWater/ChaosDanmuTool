<!--
  - Copyright 2021-2022 Golden_Water
  - SPDX-License-Identifier: AGPL-3.0-only
  -->
<script lang="ts">
  export let disablePadding: boolean = false;
  export let disableRound: boolean = false;
</script>

<div class="content" class:disablePadding class:disableRound>
  <slot />
</div>

<style>
  .content {
    margin: var(--spacerWidthHalf);
    padding: var(--spacerWidthHalf);

    height: calc(100vh - var(--spacerWidth) * 2);
    border-radius: var(--contentBorderRadius);

    background-color: var(--up);
  }

  .disablePadding {
    padding: 0;
  }

  .disableRound {
    border-radius: 0;
  }
</style>
