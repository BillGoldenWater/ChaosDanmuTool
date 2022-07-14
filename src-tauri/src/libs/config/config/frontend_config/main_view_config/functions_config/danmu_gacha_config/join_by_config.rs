/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use crate::libs::config::config::ALLOW_CONFIG_SKIP_IF;

#[derive(serde::Serialize, serde::Deserialize, ts_rs::TS, PartialEq, Debug, Clone)]
#[serde(rename_all = "camelCase", tag = "by")]
#[ts(export, export_to = "../src/share/type/rust/config/frontendConfig/mainViewConfig/functionsConfig/danmuGachaConfig/")]
pub enum JoinByConfig {
  Danmu {
    #[serde(default = "join_by_danmu_content_default")]
    #[serde(skip_serializing_if = "join_by_danmu_content_skip_if")]
    content: String
  },
  Gift {
    #[serde(default = "join_by_gift_gift_id_default")]
    #[serde(skip_serializing_if = "join_by_gift_gift_id_skip_if")]
    gift_id: i32,
    #[serde(default = "join_by_gift_gift_value_default")]
    #[serde(skip_serializing_if = "join_by_gift_gift_value_skip_if")]
    gift_value: i32,
  },
}

fn join_by_danmu_content_default() -> String {
  "".to_string()
}

fn join_by_danmu_content_skip_if(value: &String) -> bool {
  *value == join_by_danmu_content_default() && *ALLOW_CONFIG_SKIP_IF.read().unwrap()
}

fn join_by_gift_gift_id_default() -> i32 {
  -1
}

fn join_by_gift_gift_id_skip_if(value: &i32) -> bool {
  *value == join_by_gift_gift_id_default() && *ALLOW_CONFIG_SKIP_IF.read().unwrap()
}

fn join_by_gift_gift_value_default() -> i32 {
  -1
}

fn join_by_gift_gift_value_skip_if(value: &i32) -> bool {
  *value == join_by_gift_gift_value_default() && *ALLOW_CONFIG_SKIP_IF.read().unwrap()
}



