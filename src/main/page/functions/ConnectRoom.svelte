<!--
  - Copyright 2021-2022 Golden_Water
  - SPDX-License-Identifier: AGPL-3.0-only
  -->
<script lang="ts">
  import Content from "../../../share/component/Content.svelte";
  import Button from "../../../share/component/Button.svelte";
  import ConfigItem from "../../../share/component/ConfigItem.svelte";
  import Spacer from "../../../share/component/Spacer.svelte";
  import { backend } from "../../backendApi";
  import { appEnv } from "../../../share/appEnv/AppEnv";

  $: closed = $appEnv.receiverStatus === "close";
</script>

<Content>
  <div>
    <ConfigItem
      key="backend.danmuReceiver.roomid"
      type="number"
      name="房间号"
      description="B站直播房间号"
      props={{ min: 0 }}
    />
    <Button
      primary
      on:click={() => {
        closed
          ? backend && backend.connectRoom()
          : backend && backend.disconnectRoom();
      }}
      >{closed ? "连接" : "断开"}
    </Button>
  </div>
  <Spacer size="double" direction="vertical" />
  <ConfigItem
    key="backend.danmuReceiver.autoReconnect"
    type="switch"
    name="自动重连"
    description="在非正常断开连接的情况下自动重连"
  />
</Content>
