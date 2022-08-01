<!--
  - Copyright 2021-2022 Golden_Water
  - SPDX-License-Identifier: AGPL-3.0-only
  -->

<script lang="ts">
  import {colorPlates} from "../share/style/ThemeUtils";
</script>

<div class="app" style="background-color: {$colorPlates.background};color: {$colorPlates.text};">
  main_window
</div>

<style lang="less">
  .app {
    height: 100vh;
    width: 100vw;
    overflow: auto;
  }
</style>