<!--
  - Copyright 2021-2022 Golden_Water
  - SPDX-License-Identifier: AGPL-3.0-only
  -->
<script lang="ts">
  import type { TInput } from "./TInput";
  import TextInput from "./TextInput.svelte";
  import NumberInput from "./NumberInput.svelte";
  import SwitchInput from "./SwitchInput.svelte";
  import SelectInput from "./SelectInput.svelte";
  import ColorInput from "./ColorInput.svelte";
  import SliderInput from "./SliderInput.svelte";
  import { createEventDispatcher } from "svelte";

  export let props: TInput = {
    type: "text",
  };

  let dispatch = createEventDispatcher();

  function onFocus() {
    dispatch("focus");
  }

  function onBlur() {
    dispatch("blur");
  }
</script>

{#if props.type === "text"}
  <TextInput bind:props on:focus={onFocus} on:blur={onBlur} />
{:else if props.type === "number"}
  <NumberInput bind:props on:focus={onFocus} on:blur={onBlur} />
{:else if props.type === "switch"}
  <SwitchInput bind:props on:focus={onFocus} on:blur={onBlur} />
{:else if props.type === "select"}
  <SelectInput bind:props on:focus={onFocus} on:blur={onBlur} />
{:else if props.type === "color"}
  <ColorInput bind:props on:focus={onFocus} on:blur={onBlur} />
{:else if props.type === "slider"}
  <SliderInput bind:props on:focus={onFocus} on:blur={onBlur} />
{:else if props.type === "checkbox"}
  <div>CheckboxInput</div>
{:else if props.type === "radio"}
  <div>RadioInput</div>
{:else}
  <div>Unknown type: {props.type}</div>
{/if}
