/*
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export function DateFormat(): string {
  const date = new Date();
  return (
    "[" +
    date.getHours() +
    ":" +
    date.getMinutes() +
    ":" +
    date.getSeconds() +
    "." +
    date.getMilliseconds() +
    "]"
  );
}
