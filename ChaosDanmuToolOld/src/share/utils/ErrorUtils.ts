/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export function printError(location: string, e: Error) {
  console.error(
    `\n==========\n${location}\n${e.name}\n${e.message}\n${e.stack}\n==========\n`
  );
}
