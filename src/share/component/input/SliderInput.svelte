<!--
  - Copyright 2021-2022 Golden_Water
  - SPDX-License-Identifier: AGPL-3.0-only
  -->
<script lang="ts">
  import type { TNumberInput, TSliderInput } from "./TInput";
  import { spring } from "svelte/motion";
  import Input from "./Input.svelte";
  import Spacer from "../Spacer.svelte";
  import { takeNotNull } from "../../utils/ObjectUtils";
  import { createEventDispatcher } from "svelte";

  export let props: TSliderInput = {} as TSliderInput;

  let focused = false;
  let value = takeNotNull(props.value, props.defaultValue);
  $: if (props.value != null && (!focused || props.ignoreFocus))
    value = props.value;

  // region slider
  let self: HTMLDivElement;

  let percent = spring(0, {
    stiffness: 0.2,
    damping: 1,
  });
  $: percent.set((value - props.min) / (props.max - props.min));

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

  function onChange(value: number) {
    props.onChange && props.onChange(value);
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

      value = roundedPercent * vLen;
      onChange(value);
    }
  }

  let dragging: boolean = false;

  function onMouseMove(event: MouseEvent) {
    if (dragging) {
      onClick(event);
    }
  }

  // endregion

  // region direct input
  function parse(value: string) {
    return props.parser ? props.parser(value) : parseFloat(value);
  }

  function limited(value: number) {
    return Math.max(Math.min(value, props.max), props.min);
  }

  let p: TNumberInput = {
    type: "number",
    ignoreFocus: props.ignoreFocus,
    parser: (value: string) => {
      return limited(parse(value));
    },
    stringifier: props.stringifier,
    shouldTake: (value: string) => {
      return props.shouldTake ? props.shouldTake(value) : true;
    },
    onChange: (newValue: number) => {
      value = limited(newValue);
    },
  };

  $: p = {
    ...p,
    value,
    disabled: props.disabled,
  };
  // endregion

  let dispatch = createEventDispatcher();

  function onFocus() {
    dispatch("focus");

    focused = true;
  }

  function onBlur() {
    dispatch("blur");

    focused = false;
  }
</script>

<div class="sliderInput">
  <div
    class="slider"
    class:enabled={!props.disabled}
    class:disabled={props.disabled}
    bind:this={self}
    on:click={onClick}
    on:mousemove={onMouseMove}
    on:mousedown={() => (dragging = true)}
    on:mouseup={() => (dragging = false)}
    on:mouseleave={() => (dragging = false)}
    style={props.sliderLen ? `width: ${props.sliderLen}` : ""}
  >
    <!--suppress CheckEmptyScriptTag -->
    <div class="bar" />
    <!--suppress CheckEmptyScriptTag -->
    <div class="dot" style={`top: ${dotTop}px; left: ${dotLeft}px`} />
  </div>
  {#if props.withInputBox}
    <Spacer size="half" />
    <Input props={p} on:focus={onFocus} on:blur={onBlur} />
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

    width: 10em;

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
