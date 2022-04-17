/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export function constructURL(
  url: string,
  port: number,
  maxReconnectAttempt: number,
  uuid: string
): string {
  const param: URLSearchParams = new URLSearchParams([
    ["port", port.toString()],
    ["maxReconnectAttemptNum", maxReconnectAttempt.toString(10)],
    ["uuid", uuid],
  ]);
  return url + "?" + param;
}
