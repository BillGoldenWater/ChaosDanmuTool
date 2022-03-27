/*
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export function printError(e: Error) {
  console.log(`\n${e.name}\n${e.message}\n${e.stack}`);
}
