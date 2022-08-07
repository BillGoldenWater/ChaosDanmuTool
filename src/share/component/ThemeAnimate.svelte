<!--
  - Copyright 2021-2022 Golden_Water
  - SPDX-License-Identifier: AGPL-3.0-only
  -->
<script lang="ts">
  import { isDark, lastSnapshot } from "../style/ThemeUtils";
  import { spring } from "svelte/motion";

  let percent = spring(isDark() ? 0 : 100, {
    stiffness: 0.2,
    damping: 1,
  });
  let targetPercent = 0;
  let self: HTMLDivElement;
  $: {
    let last = $lastSnapshot;
    if (self && last) {
      self.innerHTML = "";
      self.append(last.snapshot);

      let target = last.dark ? 100 : 0;
      targetPercent = target;
      percent.set(target);
    }
  }

  let style;
  $: {
    let p = $percent.toFixed(4);
    if (targetPercent < p) {
      style = `-webkit-mask: radial-gradient(circle, #000F ${p}%, #0000 ${p}%);`;
    } else {
      style = `-webkit-mask: radial-gradient(circle, #0000 ${p}%, #000F ${p}%);`;
    }
    if (targetPercent == p && self) {
      self.innerHTML = "";
    }
  }
</script>

<!--suppress CheckEmptyScriptTag -->
<div class="root" bind:this={self} {style} />

<style>
  .root {
    position: fixed;

    top: 0;
    right: 0;
    bottom: 0;
    left: 0;

    height: 100vh;
    width: 100vw;

    overflow: hidden;

    pointer-events: none;
  }
</style>
