/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

//region appCommand

export class BiliBiliPackParseErrorEvent extends Event {
  packet;

  constructor(packet) {
    super("bilibiliPackParseError");

    this.packet = packet;
  }
}

export class ConfigUpdateEvent extends Event {
  config;

  constructor(config) {
    super("configUpdate");

    this.config = config;
  }
}

export class GiftConfigUpdateEvent extends Event {
  giftConfig;

  constructor(giftConfig) {
    super("giftConfigUpdate");

    this.giftConfig = giftConfig;
  }
}

export class ReceiverStatusUpdateEvent extends Event {
  status;

  constructor(status) {
    super("receiverStatusUpdate");

    this.status = status;
  }
}

//endregion

//region bilibiliCommand

export class BiliBiliCommandEvent extends Event {
  command;

  constructor(command) {
    super("bilibiliCommand");

    this.command = command;
  }
}

export class ActivityUpdateEvent extends Event {
  activity;

  constructor(activity) {
    super("activityUpdate");

    this.activity = activity;
  }
}

//endregion

export class MainEventTarget extends EventTarget {
  addEventListener(type, listener) {
    super.addEventListener(type, listener);
  }

  removeEventListener(type, listener) {
    super.addEventListener(type, listener);
  }

  dispatchEvent(event) {
    return super.dispatchEvent(event);
  }
}
