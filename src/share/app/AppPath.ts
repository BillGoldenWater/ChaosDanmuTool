/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Config } from "../type/rust/config/Config";

export interface TAppPathSet {
  set<T>(key: string, value: T): void | Promise<void>;
}

export interface TAppPathGet {
  get<T>(key: string, defaultValue?: T): T | undefined;
}

export type TAppPath = TAppPathGet & TAppPathSet;

export class AppPath implements TAppPathSet, TAppPathGet {
  url: URL;

  constructor(config: Config) {
    this.url = new URL(config.frontend.mainView.path);
    this.url.host = "app";
    this.url.protocol = "chaos:";
  }

  get<T>(key: string, defaultValue?: T): T | undefined {
    const resultStr = this.url.searchParams.get(key);
    if (resultStr != null) {
      return JSON.parse(resultStr);
    }
    return defaultValue;
  }

  set<T>(key: string, value: T): void {
    this.url.searchParams.set(key, JSON.stringify(value));
  }

  toString(): string {
    return this.url.toString();
  }
}
