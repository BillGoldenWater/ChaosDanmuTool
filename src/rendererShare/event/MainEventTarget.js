/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export class NewMessageEvent extends Event {
  message;

  constructor(message) {
    super("onmessage");

    this.message = message;
  }
}

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
