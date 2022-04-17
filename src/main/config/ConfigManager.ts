/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  Config,
  getDefaultConfig,
  getDiffConfig,
} from "../../share/config/Config";
import * as fs from "fs";
import { dialog } from "electron";
import { getProperty, setProperty } from "dot-prop";
import { ObjectPath } from "../type/TObjectPath";

export class ConfigManager {
  private static config: Config;
  private static filePath: string;
  private static inited: boolean;
  private static loaded: boolean;

  static init(filePath: string): void {
    this.config = getDefaultConfig();
    this.filePath = filePath;
    this.inited = true;
  }

  static loadDefault(config?: Config): void {
    this.config = getDefaultConfig(config);
  }

  static load(): boolean {
    if (!this.inited) return false;

    try {
      const configStr = fs.readFileSync(this.filePath, {
        flag: "r",
        encoding: "utf-8",
      });

      const config: Config = JSON.parse(configStr);

      if (config && config.forChaosDanmuTool) {
        this.loadDefault(config);
      } else {
        this.loadDefault();
      }
    } catch (e) {
      if (fs.existsSync(this.filePath)) {
        dialog.showErrorBox(
          "读取失败",
          `配置文件存在但无法读取\n可能的原因: 被其他应用程序占用, 无读取权限\n${e}`
        );
        return false;
      }

      this.loadDefault();
    }
    this.loaded = true;
    return true;
  }

  static save(): boolean {
    if (!this.isSafeToSave()) return false;

    if (fs.existsSync(this.filePath)) {
      try {
        const configStr = fs.readFileSync(this.filePath, {
          flag: "r",
          encoding: "utf-8",
        });

        const rConfig: Config = JSON.parse(configStr);

        if (rConfig.forChaosDanmuTool) {
          this.writeToFile();
        } else {
          dialog.showErrorBox(
            "保存失败",
            `存在未知的同名文件\nConfigManager.save.fileCheckFail`
          );
          return false;
        }
      } catch (e) {
        dialog.showErrorBox(
          "保存失败",
          `存在未知的同名文件\nConfigManager.save.catch\n${e}`
        );
        return false;
      }
    } else {
      this.writeToFile();
    }
    return true;
  }

  static writeToFile(): void {
    try {
      fs.writeFileSync(
        this.filePath,
        JSON.stringify(getDiffConfig(this.config), null, 2)
      );
    } catch (e) {
      dialog.showErrorBox(
        "保存失败",
        `无法写入\nConfigManager.writeToFile.catch\n${e}`
      );
    }
  }

  static isSafeToSave(): boolean {
    return this.inited && this.loaded;
  }

  static get(key: ObjectPath<Config>, defaultValue?: unknown): unknown {
    return getProperty(this.config, key, defaultValue);
  }

  static set(key: ObjectPath<Config>, value: unknown): void {
    setProperty(this.config, key, value);
    this.onChange();
  }

  static getConfig(): Config {
    return this.config;
  }

  static updateConfig(config: Config): void {
    this.config = config;
    this.onChange();
  }

  static onChange(): void {
    // TODO: CommandBroadcastServer
    // CommandBroadcastServer.broadcastMessage(
    //   getConfigUpdateMessage(this.config)
    // );
    this.get("autoSaveOnChange") ? this.save() : "";
  }
}
