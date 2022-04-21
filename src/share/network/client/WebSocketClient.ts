/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { getDefaultConfig } from "../../config/Config";

type Option = {
  host?: string;
  port?: number;
  maxReconnectCount?: number;
  noReconnectCodes?: number[];

  location: string;
  onMessage: WebSocket["onmessage"];
};

export class WebSocketClient {
  client: WebSocket;
  option: Option = {
    host: "localhost",
    port: getDefaultConfig().httpServerPort,
    maxReconnectCount: -1,
    noReconnectCodes: [],

    location: "WebSocketClient",
    onMessage: () => null,
  };

  reconnectTimeoutId: number;
  reconnectCount = 0;

  constructor(option?: Option) {
    this.updateOption(option);
  }

  updateOption(option?: Option) {
    this.option = { ...this.option, ...option };
  }

  open() {
    this.close();
    this.client = new WebSocket(`ws://localhost:${this.option.port}`);
    this.client.onmessage = this.option.onMessage;
    this.client.onopen = () => {
      this.log("client.onopen", `ws://localhost:${this.option.port} Opened`);
      this.reconnectCount = 0;
    };
    this.client.onclose = (event) => {
      if (
        this.option.noReconnectCodes.find((value) => value == event.code) ==
        null
      ) {
        this.error(
          "client.onclose",
          `Code: ${event.code}, Reason: ${event.reason}`
        );
        this.tryReconnect();
      } else {
        this.log(
          "client.onclose",
          `Code: ${event.code}, Reason: ${event.reason}`
        );
      }
    };
  }

  close(code?: number) {
    this.client?.close(code ? code : 1000);
  }

  tryReconnect() {
    window.clearTimeout(this.reconnectTimeoutId);
    if (
      this.reconnectCount >= this.option.maxReconnectCount &&
      this.option.maxReconnectCount != -1
    )
      return;

    window.setTimeout(() => {
      this.open();
      this.reconnectCount++;
    }, 1000);
  }

  log(location: string, message: string) {
    console.log(`[${this.option.location}.${location}] ${message}`);
  }

  error(location: string, message: string) {
    console.error(`[${this.option.location}.${location}] ${message}`);
  }
}
