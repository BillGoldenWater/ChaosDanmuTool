/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

const { settings } = require("./settings.mjs");

/**
 * @param {string} msg
 */
function highlightLog(msg) {
  console.log(`\u001b[94m${msg}\u001b[0m`);
}

module.exports = async ({ github, context }) => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const semver = require("semver");
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const path = require("path");
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const fs = require("fs/promises");

  // noinspection JSFileReferences
  const version = JSON.parse(
    (await fs.readFile(settings.frontendFile("package.json"))).toString()
  ).version;
  const changeLog = JSON.parse(
    (await fs.readFile("./changeLog.json")).toString()
  )[version];

  highlightLog("create draft release");
  // noinspection JSUnresolvedFunction,JSUnresolvedVariable
  const {
    data: { id: release_id },
  } = await github.rest.repos.createRelease({
    owner: context.repo.owner,
    repo: context.repo.repo,
    tag_name: version,
    name: `${changeLog["date"]} ${version}`,
    body: changeLog["content"],
    draft: true,
    prerelease: semver.parse(version).prerelease.length > 0,
  });

  let files = (await fs.readdir("out")).filter(
    (name) => !name.endsWith(".json")
  );
  files.push("updater.json");

  for (let name of files) {
    let file = path.join("out", name);
    highlightLog(`uploading ${file}`);
    // noinspection JSUnresolvedFunction,JSUnresolvedVariable
    await github.rest.repos.uploadReleaseAsset({
      owner: context.repo.owner,
      repo: context.repo.repo,
      release_id,
      name,
      data: await fs.readFile(file),
    });
  }

  highlightLog("unmark draft");
  // noinspection JSUnresolvedFunction,JSUnresolvedVariable
  await github.rest.repos.updateRelease({
    owner: context.repo.owner,
    repo: context.repo.repo,
    release_id,
    draft: false,
  });
  highlightLog("done");
};
