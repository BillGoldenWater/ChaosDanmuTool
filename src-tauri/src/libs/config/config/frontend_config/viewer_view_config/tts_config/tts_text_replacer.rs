/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use crate::libs::config::config::ALLOW_CONFIG_SKIP_IF;

#[derive(serde::Serialize, serde::Deserialize, ts_rs::TS, PartialEq, Debug)]
#[serde(rename_all = "camelCase")]
#[ts(export, export_to = "../src/share/type/rust/config/frontendConfig/viewerViewConfig/ttsConfig/")]
pub struct TTSTextReplacer {
  #[serde(default = "uuid_default")]
  #[serde(skip_serializing_if = "uuid_skip_if")]
  pub uuid: String,
  #[serde(default = "match_default")]
  #[serde(skip_serializing_if = "match_skip_if")]
  pub r#match: String,
  #[serde(default = "replace_default")]
  #[serde(skip_serializing_if = "replace_skip_if")]
  pub replace: String,
}

fn uuid_default() -> String {
  uuid::Uuid::new_v4().to_string()
}

fn uuid_skip_if(value: &String) -> bool {
  *value == uuid_default() && *ALLOW_CONFIG_SKIP_IF.read().unwrap()
}


fn match_default() -> String {
  "".to_string()
}

fn match_skip_if(value: &String) -> bool {
  *value == match_default() && *ALLOW_CONFIG_SKIP_IF.read().unwrap()
}

fn replace_default() -> String {
  "".to_string()
}

fn replace_skip_if(value: &String) -> bool {
  *value == replace_default() && *ALLOW_CONFIG_SKIP_IF.read().unwrap()
}

