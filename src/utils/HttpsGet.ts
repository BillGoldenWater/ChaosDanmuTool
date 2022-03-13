/*
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { app } from "electron";
import https from "https";

export function httpsGet(url: string): Promise<string> {
  let resStr = "";

  return new Promise<string>((resolve, reject) => {
    https
      .get(
        url,
        { headers: { "User-Agent": `ChaosDanmuTool/${app.getVersion()}` } },
        (res) => {
          res.on("data", (data) => {
            resStr += data;
          });
          res.on("end", () => {
            resolve(resStr);
          });
        }
      )
      .on("error", (err) => {
        reject(err);
      });
  });
}
