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

  export let props: TInput = {
    type: "text",
  };
</script>

{#if props.type === "text"}
  <TextInput bind:props />
{:else if props.type === "number"}
  <NumberInput bind:props />
{:else if props.type === "switch"}
  <SwitchInput bind:props />
{:else if props.type === "select"}
  <SelectInput bind:props />
{:else if props.type === "color"}
  <ColorInput bind:props />
{:else if props.type === "slider"}
  <SliderInput bind:props />
{:else if props.type === "checkbox"}
  <div>CheckboxInput</div>
{:else if props.type === "radio"}
  <div>RadioInput</div>
{:else}
  <div>Unknown type: {props.type}</div>
{/if}
