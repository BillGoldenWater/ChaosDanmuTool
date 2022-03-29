/*
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import * as fs from "fs";
import * as path from "path";
import { formatTime } from "./FormatUtils";
import { MessageLog } from "../command/messagelog/MessageLog";
import { TAnyMessage } from "../type/TAnyMessage";
import { shell } from "electron";

export class CommandHistoryManager {
  static path: string;
  static count: number;
  static filePath: string;

  static init(path: string): boolean {
    this.path = path;
    this.count = 0;

    this.toAvailableFilePath();
    try {
      if (!fs.existsSync(this.path)) {
        fs.mkdirSync(this.path);
      } else if (!fs.lstatSync(this.path).isDirectory()) {
        return false;
      }
    } catch (e) {
      return false;
    }
    return true;
  }

  /**
   * null if already has a file that has same name
   */
  static getFilePath(): string {
    // cdtdh  Chaos Danmu Tool Command History
    const fileName = path.join(
      this.path,
      `${formatTime(
        new Date(),
        "{year}-{month}-{date}-{hours}-{minutes}-{seconds}"
      )}-${this.count}.cdtch`
    );
    if (!fs.existsSync(fileName)) return fileName;
    return null;
  }

  static toAvailableFilePath() {
    this.filePath = this.getFilePath();
    while (!this.filePath) {
      this.count++;
      this.getFilePath();
    }
  }

  static new() {
    this.count = 0;
    this.toAvailableFilePath();
  }

  static writeCommand(cmd: MessageLog<TAnyMessage>) {
    if (cmd.message.cmd == "updateConfig") return;

    fs.appendFileSync(this.filePath, `${JSON.stringify(cmd)}\n`, {
      encoding: "utf-8",
    });
  }

  static async getHistory(
    fileName?: string
  ): Promise<MessageLog<TAnyMessage>[]> {
    const result: MessageLog<TAnyMessage>[] = [];

    let data;
    try {
      data = await fs.promises.readFile(
        fileName ? path.join(this.path, fileName) : this.filePath
      );
    } catch (e) {
      return result;
    }

    if (data == null || data.toString() === "") return result;
    const dataStr = data.toString("utf-8");

    for (const cmd of dataStr.split("\n")) {
      if (cmd == "") continue;
      result.push(JSON.parse(cmd));
    }

    return result;
  }

  static getFiles(): string[] {
    if (!fs.existsSync(this.path)) return [];
    return fs.readdirSync(this.path);
  }

  static deleteFile(fileName: string) {
    const filePath = path.join(this.path, fileName);
    shell.trashItem(filePath).catch(() => {
      fs.rmSync(filePath);
    });
  }

  static showInFolder(fileName: string) {
    shell.showItemInFolder(path.join(this.path, fileName));
  }
}
