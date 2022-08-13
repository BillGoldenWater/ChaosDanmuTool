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
{:else if props.type === "slider"}
  <div>SliderInput</div>
{:else if props.type === "checkbox"}
  <div>CheckboxInput</div>
{:else if props.type === "radio"}
  <div>RadioInput</div>
{:else}
  <div>Unknown type: {props.type}</div>
{/if}
