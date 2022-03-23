/*
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { app } from "electron";
import https from "https";
import * as http from "http";

export type HttpResponse = {
  res: http.IncomingMessage;
  body: string;
};

export function get(url: string): Promise<HttpResponse> {
  let resStr = "";

  return new Promise<HttpResponse>((resolve, reject) => {
    https
      .get(
        url,
        {
          headers: { "User-Agent": `ChaosDanmuTool/${app.getVersion()}` },
          timeout: 1000,
        },
        (res) => {
          res.on("data", (data) => {
            resStr += data;
          });
          res.on("end", () => {
            resolve({ res: res, body: resStr });
          });
        }
      )
      .on("error", (err) => {
        reject(err);
      });
  });
}

export async function getString(url: string): Promise<string> {
  return (await get(url)).body;
}

export async function getGithubApi(url: string): Promise<string> {
  const res = await get(url);
  if (res.body.includes("API rate limit")) {
    return JSON.stringify({
      ...JSON.parse(res.body),
      resetTime: Number.parseInt(<string>res.res.headers["x-ratelimit-reset"]),
    });
  } else {
    return res.body;
  }
}
