/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  ActivityUpdateEvent,
  AppEventTarget,
  BiliBiliPackParseErrorEvent,
  ConfigUpdateEvent,
  DanmuMessageEvent,
  GiftConfigUpdateEvent,
  RawBiliBiliCommandEvent,
  ReceiverStatusUpdateEvent,
  UserInfoUpdateEvent,
  ViewerStatusUpdateEvent,
} from "../event/AppEventTarget";
import { defaultConfig } from "./AppCtx";
import { TPartialRequired } from "../type/TPartialRequired";
import { CommandPacket } from "../type/rust/command/CommandPacket";
import { AppCommand } from "../type/rust/command/commandPacket/AppCommand";
import { BiliBiliCommand } from "../type/rust/command/commandPacket/BiliBiliCommand";
import { parseGiftConfigResponse } from "../type/TGiftConfig";

type Option = {
  host: string;
  port: number;
  maxReconnectCount: number;
  noReconnectCodes: number[];
  debug: boolean;

  location: string;
  eventTarget: AppEventTarget;
};

export class CommandReceiver {
  id = window.crypto.randomUUID().slice(0, 6);
  client: WebSocket | undefined;
  option: Option = {
    host: "localhost",
    port: defaultConfig.backend.httpServer.port,
    maxReconnectCount: -1,
    noReconnectCodes: [],
    debug: false,

    location: "CommandReceiver",
    eventTarget: new AppEventTarget(),
  };
  connected = false;

  reconnectTimeoutId: number | undefined;
  reconnectCount = 0;

  constructor(option: TPartialRequired<Option, "location" | "eventTarget">) {
    this.updateOption(option);
  }

  updateOption(option?: Partial<Option>) {
    this.option = { ...this.option, ...option };
  }

  updateId() {
    this.id = window.crypto.randomUUID().slice(0, 6);
  }

  open() {
    this.updateId();
    this.log("client.open", "open called");

    this.close_();
    this.open_();

    this.connected = true;
  }

  private open_() {
    this.log(
      "client.open_",
      `ws://${this.option.host}:${this.option.port} Connecting`
    );
    this.client = new WebSocket(`ws://${this.option.host}:${this.option.port}`);
    this.client.onopen = () => {
      this.log(
        "client.onopen",
        `ws://${this.option.host}:${this.option.port} Opened`
      );
      this.reconnectCount = 0;
    };
    this.client.onclose = ((id: string, event: CloseEvent) => {
      const noReconnect =
        this.option.noReconnectCodes.find((value) => value == event.code) ==
        null;
      const isSameSession = id === this.id;

      if (noReconnect && this.connected && isSameSession) {
        this.error(
          "client.onclose",
          `Code: ${event.code}, Reason: ${event.reason}`,
          id
        );
        this.tryReconnect();
      } else {
        this.log(
          "client.onclose",
          `Code: ${event.code}, Reason: ${event.reason}`,
          id
        );
      }
    }).bind(this, this.id);

    this.client.onmessage = this.onMessage.bind(this);
  }

  close(code?: number) {
    this.log("client.close", "close called");
    this.connected = false;
    this.close_(code);
  }

  private close_(code?: number) {
    if (this.client != null) {
      this.log("client.close_", "closing");
      this.client?.close(code ? code : 1000);
      this.client = undefined;
    }
  }

  onMessage(event: MessageEvent) {
    const de = this.option.eventTarget.dispatchEvent.bind(
      this.option.eventTarget
    );
    const commandPack: CommandPacket = JSON.parse(event.data);
    if (this.option.debug) {
      console.log(commandPack.data);
    }

    switch (commandPack.cmd) {
      case "appCommand": {
        const appCommand: AppCommand = commandPack.data;

        switch (appCommand.cmd) {
          case "biliBiliPacketParseError": {
            de(new BiliBiliPackParseErrorEvent(appCommand.data.message));
            break;
          }
          case "configUpdate": {
            de(new ConfigUpdateEvent(appCommand.data.config));
            break;
          }
          case "giftConfigUpdate": {
            de(
              new GiftConfigUpdateEvent(
                parseGiftConfigResponse(appCommand.data.giftConfigResponse)
              )
            );
            break;
          }
          case "receiverStatusUpdate": {
            de(new ReceiverStatusUpdateEvent(appCommand.data.status));
            break;
          }
          case "userInfoUpdate": {
            de(new UserInfoUpdateEvent(appCommand.data.userInfo));
            break;
          }
          case "viewerStatusUpdate": {
            de(new ViewerStatusUpdateEvent(appCommand.data.status));
            break;
          }
        }
        break;
      }
      case "biliBiliCommand": {
        const bilibiliCommand: BiliBiliCommand = commandPack.data;

        switch (bilibiliCommand.cmd) {
          case "activityUpdate": {
            de(new ActivityUpdateEvent(bilibiliCommand.data.activity));
            break;
          }
          case "danmuMessage": {
            de(new DanmuMessageEvent(bilibiliCommand.data));
            break;
          }
          case "raw": {
            de(new RawBiliBiliCommandEvent(bilibiliCommand.data));
            break;
          }
        }
        break;
      }
    }
  }

  tryReconnect() {
    window.clearTimeout(this.reconnectTimeoutId);
    if (
      this.reconnectCount >= this.option.maxReconnectCount &&
      this.option.maxReconnectCount != -1
    )
      return;

    window.setTimeout(() => {
      this.open_();
      this.reconnectCount++;
    }, 1000);
  }

  log(location: string, message: string, id?: string) {
    console.log(
      `[${id || this.id}:${this.option.location}.${location}] ${message}`
    );
  }

  error(location: string, message: string, id?: string) {
    console.error(
      `[${id || this.id}:${this.option.location}.${location}] ${message}`
    );
  }
}
