/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { ReactNode } from "react";
import { UpdateInfo } from "../page/updateinfo/UpdateInfo";
import { Config } from "../../../utils/config/Config";
import { message, notification } from "antd";
import { ResultStatus } from "../../../type/TResultStatus";

export class UpdateChecker {
  static async checkUpdate(
    config: Config,
    fromUser?: boolean
  ): Promise<ReactNode> {
    let updateInfo = null;

    const hasUpdateRes = await window.electron.checkUpdate();

    if (hasUpdateRes.status != ResultStatus.Success) {
      if (fromUser) {
        notification.error({
          message: "检查更新失败",
          description: hasUpdateRes.message || hasUpdateRes.message,
        });
      } else {
        return;
      }
    }

    const hasUpdate = hasUpdateRes.result;

    if (hasUpdate) {
      const changeLogRes = await window.electron.getChangeLog();
      const latestReleaseRes = await window.electron.getLatestRelease();
      if (
        changeLogRes.status != ResultStatus.Success ||
        latestReleaseRes.status != ResultStatus.Success
      ) {
        if (fromUser) {
          notification.error({
            message: "检查更新失败",
            description: changeLogRes.message || latestReleaseRes.message,
          });
        }
        return;
      }

      const changeLog = changeLogRes.result;
      const latestRelease = latestReleaseRes.result;

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
