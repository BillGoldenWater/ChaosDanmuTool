/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export function getParam(key: string): string | null {
  return new URLSearchParams(window.location.search).get(key);
}
