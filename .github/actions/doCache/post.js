/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

const core = require("@actions/core");
const cache = require("@actions/cache");
const { gen } = require("./genCacheInfos.mjs");

try {
  let cacheItems = gen();

  for (let cacheItem of cacheItems) {
    await cache.saveCache(cacheItem.paths, cacheItem.key);
  }
} catch (error) {
  core.setFailed(error.message);
}