import { httpsGet } from "./HttpsGet";
import { TGithubReleases } from "../type/github/TGithubReleases";
import { app, dialog } from "electron";
import { ErrorCode } from "./ErrorCode";

export class Update {
  static releaseUrl: string;
  static releasesInfo: TGithubReleases;

  static changeLogUrl: string;
  static changeLog: string;

  static getReleasesSuccess: boolean;
  static getChangeLogSuccess: boolean;

  static init(releaseApiUrl: string, changeLogUrl: string): void {
    this.releaseUrl = releaseApiUrl;
    this.changeLogUrl = changeLogUrl;
    this.getReleasesSuccess = false;
    this.getChangeLogSuccess = false;
  }

  static async updateReleaseInfo(ignoreException?: boolean): Promise<boolean> {
    let response = "";

    //region 获取数据
    try {
      response = await httpsGet(this.releaseUrl);
    } catch (e) {
      if (!ignoreException) {
        this.onReleasesGetException(e);
      }
      this.getReleasesSuccess = false;
      return false;
    }
    //endregion

    //region 解析数据
    try {
      this.releasesInfo = JSON.parse(response);
      this.releasesInfo = this.releasesInfo.filter((value) => {
        return !value.draft;
      });

      if (this.releasesInfo == null || this.releasesInfo == []) {
        if (!ignoreException) {
          this.onReleasesParseException(new Error("结果为空"));
        }
        this.getReleasesSuccess = false;
        return false;
      }
    } catch (e) {
      if (!ignoreException) {
        this.onReleasesParseException(e);
      }
      this.getReleasesSuccess = false;
      return false;
    }
    //endregion

    this.getReleasesSuccess = true;
    return true;
  }

  static async updateChangeLog(ignoreException?: boolean): Promise<boolean> {
    //region 获取数据
    try {
      this.changeLog = await httpsGet(this.changeLogUrl);
    } catch (e) {
      if (!ignoreException) {
        this.onChangeLogGetException(e);
      }
      this.getChangeLogSuccess = false;
      return false;
    }
    //endregion

    this.getChangeLogSuccess = true;
    return true;
  }

  static async getReleasesInfo(): Promise<TGithubReleases> {
    if (!this.getReleasesSuccess) {
      if (!(await this.updateReleaseInfo())) {
        return null;
      }
    }
    return this.releasesInfo;
  }

  static async getChangeLog(): Promise<string> {
    if (!this.getChangeLogSuccess) {
      if (!(await this.updateChangeLog())) {
        return "获取失败";
      }
    }
    return this.changeLog;
  }

  static async getLatestVersion(): Promise<string> {
    const info: TGithubReleases = await this.getReleasesInfo();
    if (!info) {
      return "";
    }
    return info[0].tag_name;
  }

  /*
   * @return true if it has a newer version
   * */
  static async checkUpdate(): Promise<boolean> {
    if (this.getReleasesSuccess) {
      await this.updateReleaseInfo();
    }
    const latestVer = await this.getLatestVersion();
    if (latestVer == "") {
      return false;
    }
    return versionCompare(latestVer, app.getVersion());
  }

  static onChangeLogGetException(e: unknown): void {
    this.onException(
      "无法获取更新记录, 请检查网络连接或忽略",
      ErrorCode.githubChangeLogGetFail,
      e.toString()
    );
  }

  static onReleasesGetException(e: unknown): void {
    this.onException(
      "无法获取更新信息, 请检查网络连接或忽略",
      ErrorCode.githubReleasesGetFail,
      e.toString()
    );
  }

  static onReleasesParseException(e: unknown): void {
    this.onException(
      "无法解析更新信息",
      ErrorCode.githubReleasesParseFail,
      e.toString()
    );
  }

  static onException(
    message: string,
    code: ErrorCode,
    devMessage?: string
  ): void {
    dialog.showErrorBox("错误", `${message}\n${code}\n${devMessage}`);
  }
}

/**
 * @return true if varA > verB
 */
export function versionCompare(verA: string, verB: string): boolean {
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
