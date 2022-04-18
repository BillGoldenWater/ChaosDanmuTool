/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { app } from "electron";
import { getGithubApi, getString } from "./HttpUtils";
import { TGithubReleases } from "../type/request/github/TGithubReleases";
import { Result } from "../../share/type/TResult";
import { ResultStatus } from "../../share/type/TResultStatus";
import { printError } from "../../share/utils/ErrorUtils";
import { TGithubAPIRateLimit } from "../type/request/github/TGithubAPIRateLimit";
import { TGithubRelease } from "../type/request/github/TGithubRelease";

export class UpdateUtils {
  static releaseUrl: string;
  static changeLogUrl: string;
  /**
   * second(s)
   */
  static limitResetTime: number;

  static init(releaseApiUrl: string, changeLogUrl: string): void {
    this.releaseUrl = releaseApiUrl;
    this.changeLogUrl = changeLogUrl;
  }

  static async getReleasesInfo(): Promise<Result<TGithubReleases>> {
    const result: Result<TGithubReleases> = {
      status: ResultStatus.Unknown,
      result: null,
      message: null,
    };

    let response = "";

    //region 获取数据
    try {
      response = await getGithubApi(this.releaseUrl);
    } catch (e) {
      printError("UpdateUtils.getReleasesInfo.getData", e);
      result.status = ResultStatus.Failed;
      result.message = "无法获取更新信息, 请检查网络连接或忽略";
      return result;
    }
    //endregion

    //region 解析数据
    try {
      result.result = JSON.parse(response);
      result.result = result.result.filter((value) => !value.draft);
      result.status = ResultStatus.Success;

      if (result.result == null || result.result == []) {
        return onReleasesParseFailed("结果为空");
      }
    } catch (e) {
      try {
        const apiRateLimit: TGithubAPIRateLimit = JSON.parse(response);
        this.limitResetTime = apiRateLimit.resetTime;
        return onReleasesParseFailed(
          `达到检查更新次数上限 重置时间: ${new Date(
            this.limitResetTime * 1e3
          ).toLocaleString()}`
        );
      } catch (e) {
        printError("UpdateUtils.getReleasesInfo.parseData", e);
        console.error(response);
        return onReleasesParseFailed();
      }
    }
    //endregion

    return result;
  }

  static async getChangeLog(): Promise<Result<string>> {
    const result: Result<string> = {
      status: ResultStatus.Unknown,
      result: null,
      message: null,
    };

    try {
      result.result = await getString(this.changeLogUrl);
      result.status = ResultStatus.Success;
    } catch (e) {
      printError("UpdateUtils.getChangeLog.getData", e);
      result.status = ResultStatus.Failed;
      result.message = "无法获取更新记录, 请检查网络连接或忽略";
    }

    return result;
  }

  static async getLatestRelease(): Promise<Result<TGithubRelease>> {
    const res: Result<TGithubReleases> = await this.getReleasesInfo();
    if (res.status != ResultStatus.Success)
      return {
        status: ResultStatus.Failed,
        result: null,
        message: res.message,
      };

    return {
      status: ResultStatus.Success,
      result: res.result[0],
      message: null,
    };
  }

  static async getLatestVersion(): Promise<Result<string>> {
    const res: Result<TGithubReleases> = await this.getReleasesInfo();
    if (res.status != ResultStatus.Success)
      return {
        status: ResultStatus.Failed,
        result: "",
        message: res.message,
      };

    return {
      status: ResultStatus.Success,
      result: res.result[0].tag_name,
      message: null,
    };
  }

  /*
   * @return true if it has a newer version
   * */
  static async checkUpdate(): Promise<Result<boolean>> {
    const res = await this.getLatestVersion();
    if (res.status != ResultStatus.Success)
      return {
        status: ResultStatus.Failed,
        result: false,
        message: res.message,
      };

    const latestVer = res.result;
    if (latestVer == "") {
      return {
        status: ResultStatus.Failed,
        result: false,
        message: "版本为空",
      };
    }

    return {
      status: ResultStatus.Success,
      result: versionCompare(latestVer, app.getVersion()),
      message: null,
    };
  }
}

/**
 * @return true if varA > verB
 */
function versionCompare(verA: string, verB: string): boolean {
  const a: number[] = verA.split(".").map((val) => parseInt(val, 10));
  const b: number[] = verB.split(".").map((val) => parseInt(val, 10));

  const len = Math.min(a.length, b.length);

  for (let i = 0; i < len; i++) {
    if (a[i] > b[i]) {
      return true;
    }
    if (a[i] < b[i]) {
      return false;
    }
  }

  return a.length > b.length;
}

function onReleasesParseFailed(message?: string): Result<TGithubReleases> {
  return {
    status: ResultStatus.Failed,
    result: null,
    message: message || "无法解析更新信息",
  };
}
