<!--
  - Copyright 2021-2022 Golden_Water
  - SPDX-License-Identifier: AGPL-3.0-only
  -->
<script lang="ts">
</script>

<div class="root">
  <div class="sider">
    <slot name="sider" />
  </div>
  <div class="content">
    <slot name="content">Content</slot>
  </div>
</div>

<style lang="less">
  .root {
    display: flex;
  }

  .height {
    height: calc(100vh - var(--spacerWidthHalf) * 2);
  }

  .sider {
    .height();
  }

  .content {
    .height();
    flex-grow: 1;
  }
</style>
