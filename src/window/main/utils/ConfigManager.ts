import { Config, defaultConfig } from "./Config";
import * as fs from "fs";

export class ConfigManager {
  static config: Config;
  static filePath: string;

  static init(filePath: string): void {
    this.config = JSON.parse(JSON.stringify(defaultConfig));
    this.filePath = filePath;
  }

  static load(): void {
    try {
      const configStr = fs.readFileSync(this.filePath, {
        flag: "r",
        encoding: "utf-8",
      });
      this.config = JSON.parse(configStr);
    } catch (e) {
      this.config = JSON.parse(JSON.stringify(defaultConfig));
    }
  }

  static save(): void {
    fs.writeFileSync(this.filePath, JSON.stringify(this.config, null, 2));
  }
}
