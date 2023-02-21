/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

const core = require("@actions/core");
const cache = require("@actions/cache");
const { Octokit } = require("@octokit/core");
const { createActionAuth } = require("@octokit/auth-action");

const { gen } = require("./genCacheInfos.mjs");

/**
 * @param {string} msg
 */
function highlightLog(msg) {
  console.log(`\u001b[94m${msg}\u001b[0m`);
}

async function deleteCache(octokit, key) {
  highlightLog(`deleting cache ${key}`);
  let res = await octokit.request(
    "DELETE /repos/{owner}/{repo}/actions/caches/{cache_id}",
    {
      owner: "BillGoldenWater",
      repo: "ChaosDanmuTool",
      cache_id: key,
    }
  );
  if (res.status === 204) {
    highlightLog(`delete success with response code ${res.status}`);
  } else {
    highlightLog(`delete failed with response`);
    console.log(res);
  }
}

async function main() {
  try {
    const actionOctokit = new Octokit({
      authStrategy: createActionAuth,
    });

    let cacheItems = gen();

    for (let cacheItem of cacheItems) {
      const oldKey = core.getState(`${cacheItem.id}_cacheKey`);
      if (oldKey === cacheItem.key) {
        highlightLog(`cache ${cacheItem.key} exists, skipped.`);
        continue;
      }

      highlightLog(`saving ${cacheItem.key}`);
      try {
        await cache.saveCache(cacheItem.paths, cacheItem.key);
        highlightLog(`cache ${cacheItem.key} saved`);
        if (oldKey !== undefined) {
          await deleteCache(actionOctokit, oldKey);
        }
      } catch (e) {
        console.log(e);
        highlightLog(`failed to save cache ${cacheItem.key}`);
      }
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

main().then();
