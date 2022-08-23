<!--
  - Copyright 2021-2022 Golden_Water
  - SPDX-License-Identifier: AGPL-3.0-only
  -->
<script lang="ts">
  import type { ObjectPath } from "../type/TObjectPath";
  import type { Config } from "../type/rust/config/Config";
  import type { TInput } from "./input/TInput";
  import Input from "./input/Input.svelte";
  import { getConfig } from "../appEnv/AppEnv";
  import Spacer from "./Spacer.svelte";

  export let key: ObjectPath<Config>;
  export let type: TInput["type"];

  export let props: TInput = undefined;
  export let defaultValue: unknown = undefined;
  export let disabled: boolean = false;

  export let name: string = "";
  export let description: string = "";
  export let useTooltip: boolean = false;

  export let block: boolean = false;
</script>

<div class="configItem" class:block>
  {#if key && type}
    <div class="input">
      {#if name && name.length > 0}
        <div>{name}:</div>
        <Spacer size="half" />
      {/if}
      <Input
        props={{
          ...props,
          type,
          disabled,
          value: getConfig(key, defaultValue),
        }}
      />
    </div>
    {#if !useTooltip && description && description.length > 0}
      <div class="description">{description}</div>
    {/if}
  {:else}
    <div>Props error</div>
  {/if}
</div>

<style>
  .configItem {
    display: inline-flex;
    flex-direction: column;
  }

  .input {
    display: flex;
    align-items: center;
  }

  .description {
    font-size: var(--secondaryTextSize);

    color: var(--secondaryText);
  }

  .block {
    display: flex;
  }
</style>
