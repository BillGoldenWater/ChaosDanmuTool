/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

const core = require("@actions/core");
const cache = require("@actions/cache");
const { gen } = require("./genCacheInfos.mjs");

/**
 * @param {string} msg
 */
function highlightLog(msg) {
  console.log(`\u001b[94m${msg}\u001b[0m`);
}

async function main() {
  try {
    let cacheItems = gen();

    for (let cacheItem of cacheItems) {
      highlightLog(`restoring ${cacheItem.key}`);
      let hit_key = await cache.restoreCache(
        cacheItem.paths,
        cacheItem.key,
        cacheItem.restoreKeys
      );
      highlightLog(`${hit_key} restored`);
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

main().then();
