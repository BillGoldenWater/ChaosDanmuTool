/*
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import * as fs from "fs";
import * as path from "path";
import { formatTime } from "../FormatUtils";
import { MessageLog } from "../../command/messagelog/MessageLog";
import { TAnyMessage } from "../../type/TAnyMessage";
import { shell } from "electron";
import { ConfigManager } from "../config/ConfigManager";
import { isImplementedCommand } from "./CommandHistoryImplemented";

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

    if (ConfigManager.get("history.autoCutAt") > 0) {
      try {
        const fileSizeInBytes = fs.lstatSync(this.filePath).size;
        const fileSizeInMB = fileSizeInBytes / 1000 / 1000;
        if (fileSizeInMB > ConfigManager.get("history.autoCutAt")) {
          this.count++;
          this.toAvailableFilePath();
        }
        // eslint-disable-next-line no-empty
      } catch (e) {}
    }

    fs.appendFile(
      this.filePath,
      `${JSON.stringify(cmd)}\n`,
      {
        encoding: "utf-8",
      },
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      () => {}
    );
  }

  static async getHistory(
    fileName?: string
  ): Promise<MessageLog<TAnyMessage>[]> {
    // const startTime = new Date();
    const result: MessageLog<TAnyMessage>[] = [];

    let data;
    try {
      data = await fs.promises.readFile(
        fileName ? path.join(this.path, fileName) : this.filePath
      );
    } catch (e) {
      return result;
    }
    // const readTime = new Date();

    if (data == null || data.toString() === "") return result;
    const dataStr = data.toString("utf-8");

    for (const cmd of dataStr.split("\n")) {
      if (cmd == "") continue;
      try {
        const obj: MessageLog<TAnyMessage> = JSON.parse(cmd);
        if (isImplementedCommand(obj.message)) result.push(obj);
        // eslint-disable-next-line no-empty
      } catch (e) {}
    }

    //     const parseTime = new Date();
    //
    //     console.log(
    //       `File name: ${fileName}
    // Read cost: ${readTime.getTime() - startTime.getTime()}ms
    // Parse cost: ${parseTime.getTime() - readTime.getTime()}ms
    // Total cost: ${parseTime.getTime() - startTime.getTime()}ms\n`
    //     );

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
