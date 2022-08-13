<!--
  - Copyright 2021-2022 Golden_Water
  - SPDX-License-Identifier: AGPL-3.0-only
  -->
<script lang="ts" context="module">
  function pxStrToNum(str: string) {
    return parseFloat(str.replace("px", ""));
  }
</script>

<script lang="ts">
  import type { TSelectInput } from "./TInput";
  import { spring } from "svelte/motion";

  export let props: TSelectInput = { type: "select", options: [] };

  $: current =
    props.options.find((v) => v.key === props.value)?.name || props.value;

  // region measure things
  let contentElement: HTMLDivElement;

  let maxWidth: number = 0;
  let maxHeight: number = 0;
  let totalHeight: number = 0;

  let listLeft: number = 0;
  let listTop: number = 0;
  $: {
    if (contentElement) {
      let ce = contentElement;
      // region max width/height

      maxWidth = ce.clientWidth;
      maxHeight = ce.clientHeight;
      totalHeight = 0;

      for (let opt of props.options) {
        if (opt.element) {
          ce.innerHTML = opt.name || opt.key;
          maxWidth = Math.max(maxWidth, ce.clientWidth);
          maxHeight = Math.max(maxHeight, ce.clientHeight);

          let style = window.getComputedStyle(opt.element);
          totalHeight += pxStrToNum(style.height) + pxStrToNum(style.marginTop);
        }
      }

      ce.innerHTML = current;
      // endregion

      listTop = ce.clientHeight + ce.offsetTop;
      listLeft = ce.offsetLeft;
    }
  }

  let windowHeight: number = window.innerHeight;
  let listHeightLimit;
  $: listHeightLimit = windowHeight - listTop;
  // endregion

  let expanded: boolean = false;
  let listHeight = spring(expanded ? totalHeight : 0, {
    stiffness: 0.3,
    damping: 1,
  });
  $: listHeight.set(expanded ? totalHeight : 0);

  let lastValue = props.value;
  $: {
    if (props.value !== lastValue) {
      props.onChange && props.onChange(props.value);
      lastValue = props.value;
    }
  }
</script>

<svelte:window
  on:resize={() => {
    windowHeight = document.documentElement.clientHeight;
  }}
/>
<div class="select">
  <div
    class="selectContent"
    class:enabled={!props.disabled}
    class:disabled={props.disabled}
    bind:this={contentElement}
    style={`min-width: ${maxWidth}px; min-height: ${maxHeight}px;`}
    on:click={() => {
      if (!props.disabled) expanded = !expanded;
    }}
  >
    {current}
  </div>
  <div
    class="selectList"
    style={`min-width: ${maxWidth}px; top: ${listTop}px; left: ${listLeft}px; height: ${Math.min(
      $listHeight,
      listHeightLimit
    )}px;`}
  >
    <div>
      {#each props.options as opt}
        {#if opt.key !== props.value}
          <div
            class="selectItem"
            bind:this={opt.element}
            on:click={() => {
              props.value = opt.key;
              expanded = false;
            }}
          >
            {opt.name || opt.key}
          </div>
        {/if}
      {/each}
    </div>
  </div>
</div>

<style lang="less">
  .select {
    transition: background-color 0.2s ease-out;

    display: inline-flex;
    flex-direction: column;

    user-select: none;
    -webkit-user-select: none;
    cursor: pointer;
  }

  .selectContent {
    display: flex;
    align-items: center;

    border-radius: var(--itemBorderRadius);

    padding: var(--spacerWidthHalf);
  }

  .selectList {
    position: absolute;

    border-radius: var(--itemBorderRadius);

    //noinspection CssInvalidPropertyValue
    overflow: scroll;

    z-index: 100;
  }

  .selectList::-webkit-scrollbar {
    display: none;
  }

  .selectItem {
    margin-top: var(--spacerWidthQuarter);
    padding: var(--spacerWidthQuarter) var(--spacerWidthHalf);

    border-radius: var(--itemBorderRadius);

    background-color: var(--up);

    &:hover {
      background-color: var(--upDouble);
    }

    &:active {
      background-color: var(--down);
    }
  }

  .enabled {
    background-color: var(--up);

    &:hover {
      background-color: var(--upDouble);
    }

    &:active {
      background-color: var(--down);
    }
  }

  .disabled {
    background-color: var(--down);
  }
</style>
