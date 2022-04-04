/*
 * SPDX-License-Identifier: AGPL-3.0-only
 */

/**
 *
 * @param time
 * @param format \{year} {month} {date} {hours} {minutes} {seconds}
 */
export function formatTime(
  time: Date,
  format = "{month}-{date} {hours}:{minutes}:{seconds}"
) {
  const year = time.getFullYear();
  const month = time.getMonth() + 1;
  const date = time.getDate();
  const hours = time.getHours();
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();

  const yearStr = year.toString(10).padStart(4, "0");
  const monthStr = month.toString(10).padStart(2, "0");
  const dateStr = date.toString(10).padStart(2, "0");
  const hoursStr = hours.toString(10).padStart(2, "0");
  const minutesStr = minutes.toString(10).padStart(2, "0");
  const secondsStr = seconds.toString(10).padStart(2, "0");

  return format
    .replaceAll("{year}", yearStr)
    .replaceAll("{month}", monthStr)
    .replaceAll("{date}", dateStr)
    .replaceAll("{hours}", hoursStr)
    .replaceAll("{minutes}", minutesStr)
    .replaceAll("{seconds}", secondsStr);
}
