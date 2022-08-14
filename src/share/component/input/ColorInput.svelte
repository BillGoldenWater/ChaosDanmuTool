<!--
  - Copyright 2021-2022 Golden_Water
  - SPDX-License-Identifier: AGPL-3.0-only
  -->
<script lang="ts">
  import type { TColorInput, TSliderInput } from "./TInput";
  import Input from "./Input.svelte";
  import Color from "color";
  import Spacer from "../Spacer.svelte";
  import { writable } from "svelte/store";

  export let props: TColorInput = {} as TColorInput;

  let color = writable(props.value);
  $: props.value = $color;

  $: value = props.value.hex();

  function onChange(event) {
    props.value = new Color(event.target.value).alpha(props.value.alpha());
  }

  $: alpha = { a: props.value.alpha(), c: props.value };

  let p: TSliderInput = {
    type: "slider",
    value: 0,
    max: 1,
    min: 0,
    step: 0.0075,
    sliderLen: "5em",
    withInputBox: true,
    stringifier(value: number): string {
      return props.value.alpha(value).hexa();
    },
    parser(value: string): number {
      let newColor = new Color(value.padEnd(9, "0"));
      color.set(newColor);
      return newColor.alpha();
    },
    disabled: props.disabled,
    onChange(value: number) {
      color.set(new Color(props.value.toString()).alpha(value));
    },
  };

  $: p = {
    ...p,
    value: alpha.a,
  };

  let lastValue = props.value;
  $: {
    if (props.value !== lastValue) {
      props.onChange && props.onChange(props.value);
      lastValue = props.value;
    }
  }
</script>

<div
  class="colorInput"
  class:withAlpha={props.withAlpha}
  class:enabled={props.withAlpha && !props.disabled}
  class:disabled={props.withAlpha && props.disabled}
>
  {#if !props.disabled}
    <input type="color" {value} on:change={onChange} />
  {:else}
    <input type="color" {value} disabled="disabled" />
  {/if}
  {#if props.withAlpha}
    <div class="alphaSlider">
      <Spacer size="quarter" />
      <Input props={p} />
    </div>
  {/if}
</div>

<style>
  .colorInput {
    display: inline-flex;
    align-items: center;

    user-select: none;
    -webkit-user-select: none;
  }

  .withAlpha {
    padding: var(--spacerWidthQuarter);

    border-radius: var(--itemBorderRadius);
  }

  .enabled {
    background-color: var(--up);
  }

  .disabled {
    background-color: var(--down);

    color: var(--secondaryText);
  }

  .alphaSlider {
    display: inline-flex;
    align-items: center;

    /*width: 10em;*/
  }
</style>
