/*
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export function getTag(obj: unknown): string {
  return Object.prototype.toString.call(obj);
}

export const arrayTag = getTag([]);
type AnyExceptArray = {
  [key: string]: AnyExceptArray | string | number | boolean;
};

function isTagEqual(objA: unknown, objB: unknown): boolean {
  return getTag(objA) === getTag(objB);
}

/**
 * Get part of {obj} that different than {src}, array(s) will be excluded.
 */
export function getDiff<T>(obj: T, src: T): T | undefined {
  const diff: AnyExceptArray = {};

  for (const srcKey in src) {
    if (obj[srcKey] == null) continue;
    if (isTagEqual(obj[srcKey], Array.of())) continue;

    if (isTagEqual(obj[srcKey], "")) {
      if (obj[srcKey] != src[srcKey])
        diff[srcKey] = obj[srcKey] as unknown as string;
      continue;
    }
    if (isTagEqual(obj[srcKey], 0)) {
      if (obj[srcKey] != src[srcKey])
        diff[srcKey] = obj[srcKey] as unknown as number;
      continue;
    }
    if (isTagEqual(obj[srcKey], false)) {
      if (obj[srcKey] != src[srcKey])
        diff[srcKey] = obj[srcKey] as unknown as boolean;
      continue;
    }

    const diffObj = getDiff(
      obj[srcKey],
      src[srcKey]
    ) as unknown as AnyExceptArray;

    if (Object.keys(diffObj).length > 0) {
      diff[srcKey] = diffObj;
    }
  }

  if (isTagEqual(diff, Object) && Object.keys(diff).length === 0) {
    return undefined;
  }

  return diff as unknown as T;
}

export function getArrayDiff<T>(
  array: T[],
  src: T,
  defaultArray: T[],
  additionalProcess?: (diff: T, origin: T) => T
): T[] | undefined {
  let diffArray = [];
  for (const item of array) {
    diffArray.push(
      ((it: T) => {
        return additionalProcess ? additionalProcess(it, item) : it;
      })(getDiff(item, src))
    );
  }

  diffArray = diffArray.filter((value) => value != null);
  return diffArray.length > 0 &&
    JSON.stringify(defaultArray) !== JSON.stringify(diffArray)
    ? diffArray
    : undefined;
}
