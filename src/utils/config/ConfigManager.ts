import { Config, getDefaultConfig } from "./Config";
import * as fs from "fs";
import { errorCode } from "../ErrorCode";
import { dialog } from "electron";
import { WebsocketServer } from "../server/WebsocketServer";
import { getConfigUpdateMessage } from "../command/ConfigUpdate";
import dotProp from "dot-prop";

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

  static load(): void {
    if (!this.inited) return;

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
          `${errorCode.readException}\n配置文件存在但无法读取\n可能的原因: 被其他应用程序占用, 无读取权限`
        );
      }

      this.loadDefault();
    }
    this.loaded = true;
  }

  static save(): void {
    if (!this.isSafeToSave()) return;

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
            `${errorCode.unknownExistsFile}\n存在未知的同名文件`
          );
        }
      } catch (e) {
        dialog.showErrorBox(
          "保存失败",
          `${errorCode.unknownExistsFile}\n存在未知的同名文件`
        );
      }
    } else {
      this.writeToFile();
    }
  }

  static writeToFile(): void {
    fs.writeFileSync(this.filePath, JSON.stringify(this.config, null, 2));
  }

  static isSafeToSave(): boolean {
    return this.inited && this.loaded;
  }

  static get(key: string, defaultValue?: unknown): unknown {
    return dotProp.get(this.config, key, defaultValue);
  }

  static set(key: string, value: unknown): void {
    dotProp.set(this.config, key, value);
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
    WebsocketServer.broadcast(
      JSON.stringify(getConfigUpdateMessage(this.config))
    );
    this.get("autoSaveOnChange") ? this.save() : "";
  }
}
