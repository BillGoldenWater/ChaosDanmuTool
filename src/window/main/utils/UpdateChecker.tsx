/*
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { ReactNode } from "react";
import { UpdateInfo } from "../page/updateinfo/UpdateInfo";
import { Config } from "../../../utils/config/Config";
import { message } from "antd";

export class UpdateChecker {
  static async checkUpdate(
    config: Config,
    fromUser?: boolean
  ): Promise<ReactNode> {
    let updateInfo = null;

    const hasUpdate = await window.electron.checkUpdate();

    if (hasUpdate) {
      const changeLog = await window.electron.getChangeLog();
      const releasesInfo = await window.electron.getReleasesInfo();

      const latestRelease = releasesInfo[0];

      if (latestRelease.tag_name == config.update.ignoreVersion) {
        if (!fromUser) {
          return;
        }
      }

      updateInfo = (
        <UpdateInfo githubRelease={latestRelease} changeLog={changeLog} />
      );
    } else {
      if (fromUser) {
        message.success("当前已是最新版本").then();
      }
    }

    return updateInfo;
  }
}
