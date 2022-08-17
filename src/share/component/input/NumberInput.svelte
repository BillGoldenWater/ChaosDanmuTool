<!--
  - Copyright 2021-2022 Golden_Water
  - SPDX-License-Identifier: AGPL-3.0-only
  -->
<script lang="ts">
  import type { TNumberInput, TTextInput } from "./TInput";
  import Input from "./Input.svelte";
  import { createEventDispatcher } from "svelte";

  export let props: TNumberInput = { type: "number" };
  $: acceptFloat = props.acceptFloat ? props.acceptFloat : false;

  let p: TTextInput = {
    type: "text",
    disabled: props.disabled,
    defaultValue: props.defaultValue && toString(props.defaultValue),
    ignoreFocus: props.ignoreFocus,
    value: props.value && toString(props.value),
    onChange: (value) => {
      if (shouldTake(value)) {
        props.onChange && props.onChange(parse(value));
      }
    },
  };

  let focused = false;
  $: if (!focused || props.ignoreFocus) p.value = toString(props.value);

  function toString(value: number): string {
    return props.stringifier ? props.stringifier(value) : value.toString();
  }

  function parse(value: string): number {
    return props.parser
      ? props.parser(value)
      : acceptFloat
      ? parseFloat(value)
      : parseInt(value);
  }

  function isUnfinishedFloat(value: string): boolean {
    return acceptFloat && value.endsWith(".");
  }

  function isLegal(value: number): boolean {
    return !isNaN(value) && isFinite(value);
  }

  function shouldTake(value: string): boolean {
    let parsed = parse(value);
    return props.shouldTake
      ? props.shouldTake(value)
      : !isUnfinishedFloat(value) && isLegal(parsed);
  }

  // region event
  let dispatch = createEventDispatcher();

  function onFocus() {
    dispatch("focus");

    focused = true;
  }

  function onBlur() {
    dispatch("blur");

    focused = false;
    p.value = toString(props.value);
  }

  // endregion
</script>

<Input props={p} on:focus={onFocus} on:blur={onBlur} />
