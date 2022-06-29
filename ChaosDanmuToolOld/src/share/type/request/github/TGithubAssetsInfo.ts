/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { TGithubUser } from "./TGithubUser";

export type TGithubAssetsInfo = {
  url: string;
  id: number;
  node_id: string;
  name: string;
  label: string;
  uploader: TGithubUser;
  content_type: string;
  state: string;
  size: number;
  download_count: number;
  created_at: string;
  updated_at: string;
  browser_download_url: string;
};
