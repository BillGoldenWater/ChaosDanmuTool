<!--
  - Copyright 2021-2022 Golden_Water
  - SPDX-License-Identifier: AGPL-3.0-only
  -->
<script lang="ts">
  import type { TInput } from "./TInput";
  import TextInput from "./TextInput.svelte";
  import NumberInput from "./NumberInput.svelte";

  export let props: TInput = {
    type: "text",
  };
  $: p = props;
</script>

{#if p.type === "text"}
  <TextInput bind:props={p} />
{:else if p.type === "number"}
  <NumberInput bind:props={p} />
{:else if p.type === "switch"}
  <div>SwitchInput</div>
{:else if p.type === "select"}
  <div>SelectInput</div>
{:else if p.type === "slider"}
  <div>SliderInput</div>
{:else if p.type === "checkbox"}
  <div>CheckboxInput</div>
{:else if p.type === "radio"}
  <div>RadioInput</div>
{:else}
  <div>Unknown type: {p.type}</div>
{/if}
