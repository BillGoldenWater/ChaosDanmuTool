<!--
  - Copyright 2021-2022 Golden_Water
  - SPDX-License-Identifier: AGPL-3.0-only
  -->
<script lang="ts">
  import type { TColorInput, TSliderInput } from "./TInput";
  import Input from "./Input.svelte";
  import Color from "color";
  import Spacer from "../Spacer.svelte";
  import { takeNotNull } from "../../utils/ObjectUtils";
  import { createEventDispatcher } from "svelte";

  export let props: TColorInput = {} as TColorInput;

  let value = takeNotNull(props.value, props.defaultValue);
  let focused = false;
  $: if (props.value != null && (!focused || props.ignoreFocus))
    value = props.value;

  $: hexValue = value.hex();

  function onChange(newValue: Color) {
    newValue = props.withAlpha ? newValue : newValue.alpha(1);
    value = newValue;
    props.onChange && props.onChange(newValue);
  }

  function onInputChange(event) {
    onChange(new Color(event.target.value).alpha(value.alpha()));
  }

  $: alpha = { a: value.alpha(), c: value };

  let p: TSliderInput = {
    type: "slider",
    value: 0,
    max: 1,
    min: 0,
    step: 0.0075,
    sliderLen: "5em",
    withInputBox: true,
    stringifier: (alpha: number) => {
      return value.alpha(alpha).hexa();
    },
    parser: (colorStr: string) => {
      try {
        let newColor = new Color(colorStr);
        return newColor.alpha();
      } catch (e) {
        return value.alpha();
      }
    },
    shouldTake: (colorStr: string) => {
      try {
        value = new Color(colorStr);
        return true;
      } catch (e) {
        return false;
      }
    },
    disabled: props.disabled,
    onChange(alpha: number) {
      onChange(new Color(value.toString()).alpha(alpha));
    },
  };

  $: p = {
    ...p,
    value: alpha.a,
  };

  // region event
  let dispatch = createEventDispatcher();

  function onFocus() {
    dispatch("focus");

    focused = true;
  }

  function onBlur() {
    dispatch("blur");

    focused = false;
    if (props.value != null && props.value.toString() !== value.toString()) {
      onChange(value);
    }
  }

  // endregion
</script>

<div
  class="colorInput"
  class:withAlpha={props.withAlpha}
  class:enabled={props.withAlpha && !props.disabled}
  class:disabled={props.withAlpha && props.disabled}
>
  {#if !props.disabled}
    <input type="color" {hexValue} on:change={onInputChange} />
  {:else}
    <input type="color" {hexValue} disabled="disabled" />
  {/if}
  {#if props.withAlpha}
    <div class="alphaSlider">
      <Spacer size="quarter" />
      <Input props={p} on:focus={onFocus} on:blur={onBlur} />
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
