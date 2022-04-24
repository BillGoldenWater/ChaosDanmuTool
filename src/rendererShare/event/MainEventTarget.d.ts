/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { TCommandPack } from "../../share/type/commandPack/TCommandPack";

declare class NewMessageEvent extends Event {
  message: TCommandPack;

  constructor(message: TCommandPack);
}

interface MainEventMap {
  onmessage: NewMessageEvent;
}

declare class MainEventTarget extends EventTarget {
  addEventListener<K extends keyof MainEventMap>(
    type: K,
    listener: (event: MainEventMap[K]) => void
  ): void;

  removeEventListener<K extends keyof MainEventMap>(
    type: K,
    listener: (event: MainEventMap[K]) => void
  ): void;

  dispatchEvent<K extends keyof MainEventMap>(event: MainEventMap[K]): boolean;
}
