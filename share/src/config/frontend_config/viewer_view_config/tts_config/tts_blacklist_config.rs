/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

#[derive(serde::Serialize, serde::Deserialize, PartialEq, Eq, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct TTSBlacklistConfig {
  #[serde(default = "uuid_default")]
  pub uuid: String,
  #[serde(default = "match_default")]
  pub r#match: String,
}

fn uuid_default() -> String {
  uuid::Uuid::new_v4().to_string()
}

fn match_default() -> String {
  "".to_string()
}
