<!--
  - Copyright 2021-2022 Golden_Water
  - SPDX-License-Identifier: AGPL-3.0-only
  -->
<script lang="ts">
  import type { TTextInput } from "./TInput";
  import { createEventDispatcher } from "svelte";
  import { takeNotNull } from "../../utils/ObjectUtils";
  import { writable } from "svelte/store";
  import type { Writable } from "svelte/store";
  import { doUpdate } from "./TInput";

  export let props: TTextInput = { type: "text" };
  let p: Writable<TTextInput> = writable(props);
  $: p.set(props);

  let displayValue = writable(takeNotNull(props.defaultValue, props.value, ""));
  let focused = false;

  function update(value: string) {
    displayValue.set(value);
  }

  p.subscribe((props) => {
    doUpdate(props, $displayValue, focused, update);
  });

  displayValue.subscribe((value) => {
    $p.onChange && $p.onChange(value);
    doUpdate($p, $displayValue, focused, update);
  });

  // region event
  let dispatch = createEventDispatcher();

  function onFocus() {
    dispatch("focus");

    focused = true;
  }

  function onBlur() {
    dispatch("blur");

    focused = false;
    doUpdate($p, $displayValue, focused, update);
  }

  // endregion
</script>

<!--suppress CheckEmptyScriptTag -->
<div
  contenteditable
  bind:innerHTML={$displayValue}
  class:enabled={!props.disabled}
  class:disabled={props.disabled}
  on:focus={onFocus}
  on:blur={onBlur}
/>

<style lang="less">
  div {
    transition: background-color 0.2s ease-out;

    display: inline-block;

    margin: 0;
    padding: var(--spacerWidthHalf);

    min-width: 6em;

    word-break: keep-all;
    word-wrap: normal;

    outline: none;

    border-radius: var(--itemBorderRadius);

    font-size: 14px;

    user-select: text;
    -webkit-user-select: text;
  }

  .enabled {
    color: var(--text);

    background-color: var(--up);

    &:hover,
    &:focus {
      background-color: var(--upDouble);
    }
  }

  .disabled {
    color: var(--secondaryText);

    background-color: var(--down);

    user-select: none;
    -webkit-user-select: none;
  }
</style>
