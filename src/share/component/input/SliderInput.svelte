<!--
  - Copyright 2021-2022 Golden_Water
  - SPDX-License-Identifier: AGPL-3.0-only
  -->
<script lang="ts">
  import type { TSliderInput, TTextInput } from "./TInput";
  import { spring } from "svelte/motion";
  import Input from "./Input.svelte";
  import Spacer from "../Spacer.svelte";

  export let props: TSliderInput = {
    type: "slider",
    value: 0,
    min: 0,
    max: 0,
    step: 0,
    withInputBox: false,
  };

  // region slider
  let self: HTMLDivElement;

  let percent = spring(0, {
    stiffness: 0.2,
    damping: 1,
  });
  $: percent.set((props.value - props.min) / (props.max - props.min));

  let dotTop = 0;
  let dotLeft = 0;
  $: {
    if (self) {
      let rect = self.getBoundingClientRect();
      let maxLeft = rect.left + rect.width - rect.height;
      let len = maxLeft - rect.left;
      let left = rect.left + len * $percent;

      dotTop = rect.top;
      dotLeft = left;
    }
  }

  function onClick(event: MouseEvent) {
    if (!props.disabled && self) {
      let p = Math.min(
        Math.max(event.offsetX / self.getBoundingClientRect().width, 0),
        1
      );

      let vLen = props.max - props.min;
      let stepP = 1 / (vLen / props.step);

      let roundedPercent = Math.round(p / stepP) * stepP;
      percent.set(roundedPercent);
      props.value = roundedPercent * vLen;
    }
  }

  let lastValue = props.value;
  $: {
    if (lastValue !== props.value) {
      props.onChange && props.onChange(props.value);
      lastValue = props.value;
    }
  }
  // endregion

  // region direct input
  let p: TTextInput = {
    type: "text",
    onChange(value: string): void {
      let v = props.parser ? props.parser(value) : parseFloat(value);
      if (isNaN(v) || !isFinite(v)) {
        v = props.value;
      }
      props.value = Math.max(Math.min(v, props.max), props.min);
    },
  };

  $: p = {
    ...p,
    value: props.stringifier
      ? props.stringifier(props.value)
      : props.value.toString(),
    disabled: props.disabled,
  };
  // end region
</script>

<div class="sliderInput">
  <div
    class="slider"
    class:enabled={!props.disabled}
    class:disabled={props.disabled}
    bind:this={self}
    on:click={onClick}
    style={props.sliderLen ? `width: ${props.sliderLen}` : ""}
  >
    <!--suppress CheckEmptyScriptTag -->
    <div class="bar" />
    <!--suppress CheckEmptyScriptTag -->
    <div class="dot" style={`top: ${dotTop}px; left: ${dotLeft}px`} />
  </div>
  {#if props.withInputBox}
    <Spacer size="half" />
    <Input props={p} />
  {/if}
</div>

<style lang="less">
  .sliderInput {
    display: inline-flex;
    align-items: center;
  }

  .slider {
    --Padding: calc(var(--spacerWidthQuarter) / 1.25);
    --Inner: calc(var(--spacerWidthQuarter) * 1.25);
    --Total: calc(var(--Padding) * 2 + var(--Inner));

    padding: var(--Padding);

    border-radius: var(--itemBorderRadius);

    user-select: none;
    -webkit-user-select: none;

    cursor: pointer;
  }

  .enabled {
    background-color: var(--up);

    .bar {
      background-color: var(--upDouble);
    }

    .dot {
      border-color: var(--themePrimaryUp);

      background-color: var(--upDouble);
    }
  }

  .disabled {
    background-color: var(--down);

    .bar {
      background-color: var(--downDouble);
    }

    .dot {
      border-color: var(--themeUp);

      background-color: var(--downDouble);
    }
  }

  .bar {
    height: var(--Inner);

    border-radius: var(--itemBorderRadius);
  }

  .dot {
    position: absolute;

    width: var(--Total);
    height: var(--Total);

    border-style: solid;
    border-width: var(--Padding);
    border-radius: 50%;

    pointer-events: none;
  }
</style>
