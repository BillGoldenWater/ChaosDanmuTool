<!--
  - Copyright 2021-2022 Golden_Water
  - SPDX-License-Identifier: AGPL-3.0-only
  -->
<script lang="ts">
  export let size: "double" | "normal" | "half" | "quarter" = "normal";
  export let direction: "horizontal" | "vertical" = "horizontal";

  let attrName = direction === "horizontal" ? "width" : "height";
  let attrValue = "";
  // noinspection JSUnreachableSwitchBranches
  switch (size) {
    case "double": {
      attrValue = "var(--spacerWidthDouble)";
      break;
    }
    case "normal": {
      attrValue = "var(--spacerWidth)";
      break;
    }
    case "half": {
      attrValue = "var(--spacerWidthHalf)";
      break;
    }
    case "quarter": {
      attrValue = "var(--spacerWidthQuarter)";
      break;
    }
  }
</script>

<!--suppress CheckEmptyScriptTag -->
<div class="spacer" style={`${attrName}: ${attrValue};`} />

<style>
  .spacer {
    display: inline-block;
  }
</style>
