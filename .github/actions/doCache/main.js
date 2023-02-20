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
    core.exportVariable(
      "ACTIONS_CACHE_URL",
      process.env.ACTIONS_CACHE_URL || ""
    );
    core.exportVariable(
      "ACTIONS_RUNTIME_TOKEN",
      process.env.ACTIONS_RUNTIME_TOKEN || ""
    );
    core.exportVariable("SCCACHE_GHA_ENABLED", "on");

    let cacheItems = gen();

    for (let cacheItem of cacheItems) {
      highlightLog(`restoring ${cacheItem.key}`);
      let hit_key = await cache.restoreCache(
        cacheItem.paths,
        cacheItem.key,
        cacheItem.restoreKeys
      );

      if (cacheItem.afterRestore !== undefined) cacheItem.afterRestore();

      if (hit_key === undefined) {
        highlightLog(`failed to restore ${cacheItem.key}`);
        continue;
      } else if (hit_key !== cacheItem.key) {
        highlightLog(`unable to find ${cacheItem.key}, fallback to ${hit_key}`);
      } else {
        highlightLog(`${hit_key} restored`);
      }

      core.saveState(`${cacheItem.id}_cacheKey`, hit_key);
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

main().then();
