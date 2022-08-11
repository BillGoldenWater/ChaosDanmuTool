/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

//region appCommand
export class BiliBiliPackParseErrorEvent extends Event {
  message;

  constructor(message) {
    super("biliBiliPackParseError");
    this.message = message;
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

export class ViewerStatusUpdateEvent extends Event {
  status;

  constructor(status) {
    super("viewerStatusUpdate");
    this.status = status;
  }
}

//endregion

//region bilibiliCommand
export class ActivityUpdateEvent extends Event {
  activity;

  constructor(activity) {
    super("activityUpdate");
    this.activity = activity;
  }
}

export class DanmuMessageEvent extends Event {
  message;

  constructor(message) {
    super("danmuMessage");
    this.message = message;
  }
}

export class RawBiliBiliCommandEvent extends Event {
  raw;

  constructor(raw) {
    super("rawBiliBiliCommand");
    this.raw = raw;
  }
}

//endregion

export class AppEventTarget extends EventTarget {
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
