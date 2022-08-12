<!--
  - Copyright 2021-2022 Golden_Water
  - SPDX-License-Identifier: AGPL-3.0-only
  -->
<script lang="ts">
  import type { TNumberInput, TTextInput } from "./TInput";
  import TextInput from "./TextInput.svelte";

  export let props: TNumberInput = { type: "number" };

  let p: TTextInput = {
    type: "text",
    onChange(value: string) {
      props.onChange(parseValue(props.value, value, props.acceptFloat));
    },
    disabled: props.disabled,
    value: props.value.toString(),
  };

  function parseValue(previousValue, value, acceptFloat) {
    let result;

    if (acceptFloat) {
      result = parseFloat(value);
    } else {
      result = parseInt(value);
    }

    if (isNaN(result) || !isFinite(result)) {
      result = previousValue;
    }

    return result;
  }

  $: {
    if (props.value.toString() !== p.value) {
      props.value = parseValue(props.value, p.value, props.acceptFloat);

      if (!(props.acceptFloat && p.value.endsWith("."))) {
        p.value = props.value.toString();
      }
    }
  }
</script>

<TextInput bind:props={p} />
