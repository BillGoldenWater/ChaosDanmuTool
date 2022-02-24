import { TGithubUser } from "./TGithubUser";
import { TGithubAssetsInfo } from "./TGithubAssetsInfo";

export type TGithubRelease = {
  url: string;
  assets_url: string;
  upload_url: string;
  html_url: string;
  id: number;
  author: TGithubUser;
  node_id: string;
  tag_name: string;
  target_commitish: string;
  name: string;
  draft: boolean;
  prerelease: boolean;
  created_at: string;
  published_at: string;
  assets: TGithubAssetsInfo[];
  tarball_url: string;
  zipball_url: string;
  body: string;
};
