/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { TGithubReleases } from "../type/github/TGithubReleases";
import { getGithubApi, getString } from "./HttpUtils";
import { app } from "electron";
import { TGithubRelease } from "../type/github/TGithubRelease";
import { ResultStatus } from "../type/TResultStatus";
import { UpdateUtilsResult } from "../type/TUpdateUtilsResult";
import { printError } from "./ErrorUtils";
import { TGithubAPIRateLimit } from "../type/github/TGithubAPIRateLimit";

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

  static async getReleasesInfo(): Promise<UpdateUtilsResult<TGithubReleases>> {
    const result: UpdateUtilsResult<TGithubReleases> = {
      status: ResultStatus.Unknown,
      result: null,
      message: null,
    };

    let response = "";

    //region 获取数据
    try {
      response = await getGithubApi(this.releaseUrl);
    } catch (e) {
      printError(e);
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
        console.log(response);
        printError(e);
        return onReleasesParseFailed();
      }
    }
    //endregion

    return result;
  }

  static async getChangeLog(): Promise<UpdateUtilsResult<string>> {
    const result: UpdateUtilsResult<string> = {
      status: ResultStatus.Unknown,
      result: null,
      message: null,
    };

    try {
      result.result = await getString(this.changeLogUrl);
      result.status = ResultStatus.Success;
    } catch (e) {
      printError(e);
      result.status = ResultStatus.Failed;
      result.message = "无法获取更新记录, 请检查网络连接或忽略";
    }

    return result;
  }

  static async getLatestRelease(): Promise<UpdateUtilsResult<TGithubRelease>> {
    const res: UpdateUtilsResult<TGithubReleases> =
      await this.getReleasesInfo();
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

  static async getLatestVersion(): Promise<UpdateUtilsResult<string>> {
    const res: UpdateUtilsResult<TGithubReleases> =
      await this.getReleasesInfo();
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
  static async checkUpdate(): Promise<UpdateUtilsResult<boolean>> {
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

function onReleasesParseFailed(
  message?: string
): UpdateUtilsResult<TGithubReleases> {
  return {
    status: ResultStatus.Failed,
    result: null,
    message: message || "无法解析更新信息",
  };
}
