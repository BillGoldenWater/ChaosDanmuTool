/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

/**
 * @param {string} msg
 */
function highlightLog(msg) {
    console.log(`\u001b[94m${msg}\u001b[0m`);
}

module.exports = async ({github, context}) => {
    const semver = require("semver");
    const path = require("path");
    const fs = require("fs/promises");

    // noinspection JSFileReferences
    const version = JSON.parse((await fs.readFile("./package.json")).toString()).version
    const changeLog = JSON.parse((await fs.readFile("./changeLog.json")).toString())[version]

    // noinspection JSUnresolvedFunction,JSUnresolvedVariable
    const {data: release_id} = await github.rest.repos.createRelease({
        owner: context.repo.owner,
        repo: context.repo.repo,
        tag_name: version,
        name: `${changeLog["date"]} ${version}`,
        body: changeLog["content"],
        draft: true,
        prerelease: semver.parse(version).prerelease.length > 0
    })

    let files = (await fs.readdir("out"))
        .filter(name => !name.endsWith(".json"))
    files.push("updater.json")

    files = files.map(name => path.join("out", name))

    for (let file of files) {
        highlightLog(`uploading ${file}`)
        // noinspection JSUnresolvedFunction,JSUnresolvedVariable
        await github.rest.repos.uploadReleaseAsset({
            owner: context.repo.owner,
            repo: context.repo.repo,
            release_id,
            name: file,
            data: await fs.readFile(file),
        });
    }

    // noinspection JSUnresolvedFunction,JSUnresolvedVariable
    await github.rest.repos.updateRelease({
        owner: context.repo.owner,
        repo: context.repo.repo,
        release_id,
        draft: false
    })
}