<!--
  - Copyright 2021-2022 Golden_Water
  - SPDX-License-Identifier: AGPL-3.0-only
  -->
<script lang="ts">
  import type { TTextInput } from "./TInput";

  export let props: TTextInput = { type: "text" };
  let lastValue = props.value;
  $: {
    if (props.disabled) {
      props.value = lastValue;
    } else {
      lastValue = props.value;
    }
  }
</script>

<!--suppress CheckEmptyScriptTag -->
<div
  contenteditable
  bind:innerHTML={props.value}
  class:enabled={!props.disabled}
  class:disabled={props.disabled}
  on:input={() => props.onChange && props.onChange(props.value)}
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
