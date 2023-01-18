/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

const core = require("@actions/core");
const cache = require("@actions/cache");
const { gen } = require("./genCacheInfos.mjs");

async function main() {
  try {
    let cacheItems = gen();

    for (let cacheItem of cacheItems) {
      await cache.restoreCache(
        cacheItem.paths,
        cacheItem.key,
        cacheItem.restoreKeys
      );
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

main().then();
