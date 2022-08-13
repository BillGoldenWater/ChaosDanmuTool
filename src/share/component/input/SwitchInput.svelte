<!--
  - Copyright 2021-2022 Golden_Water
  - SPDX-License-Identifier: AGPL-3.0-only
  -->
<script lang="ts">
  import type { TSwitchInput } from "./TInput";
  import { spring } from "svelte/motion";

  export let props: TSwitchInput = { type: "switch" };

  let self: HTMLDivElement;
  let slider: HTMLDivElement;
  let previousValue = props.value;

  let transX = spring(0, {
    stiffness: 0.2,
    damping: 0.4,
  });

  $: sliderStyle = `transform: translateX(calc(${$transX}px));`;

  $: {
    if (props.value) {
      if (self && slider) {
        let padding = parseInt(
          window.getComputedStyle(self).paddingLeft.replace("px", "")
        );

        transX.set(self.clientWidth - padding * 2 - slider.clientWidth);
      }
    } else {
      transX.set(0);
    }
  }

  $: {
    if (props.value !== previousValue) {
      props.onChange(props.value);
      previousValue = props.value;
    }
  }
</script>

<div
  class="switch"
  class:enabled={!props.disabled && !props.value}
  class:checked={!props.disabled && props.value}
  class:disabled={props.disabled}
  bind:this={self}
  on:click={() => {
    props.value = !props.value;
  }}
>
  <!--suppress CheckEmptyScriptTag -->
  <div class="slider" style={sliderStyle} bind:this={slider} />
</div>

<style lang="less">
  .switch {
    transition: background-color 0.1s ease-out;

    display: inline-flex;

    padding: var(--spacerWidthQuarter);

    width: 2.75rem;

    border-radius: var(--itemBorderRadius);
  }

  .enabled {
    background-color: var(--up);

    .slider {
      background-color: var(--themeText);
    }

    &:hover {
      background-color: var(--upDouble);
    }

    &:active {
      background-color: var(--down);
    }
  }

  .checked {
    background-color: var(--themeUp);

    .slider {
      background-color: var(--themeSolid);
    }

    &:hover {
      background-color: var(--themeUpDouble);
    }

    &:active {
      background-color: var(--themeDown);
    }
  }

  .disabled {
    background-color: var(--down);

    .slider {
      background-color: var(--themeUpDouble);
    }
  }

  .slider {
    display: inline-flex;

    height: 1em;
    width: 1em;

    border-radius: 50%;
  }
</style>
