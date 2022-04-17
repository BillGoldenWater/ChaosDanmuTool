/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { TViewerUrlParam } from "../type/TViewerUrlParam";

type Params = {
  [key: string]: string;
};

export function addParams(url: string, params: Params): string {
  const result: URL = new URL(url);
  for (const key in params) {
    if (params[key] != null) result.searchParams.append(key, params[key]);
  }
  return result.toString();
}

export function constructViewerUrl(
  url: string,
  option: TViewerUrlParam
): string {
  return addParams(url, {
    port: option.port?.toString(),
    maxReconnectAttemptNumber: option.maxReconnectAttemptNumber?.toString(),
    uuid: option.uuid,
  });
}
