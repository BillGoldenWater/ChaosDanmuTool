/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

#[derive(serde::Serialize, serde::Deserialize, PartialEq, Eq, Debug, Clone)]
#[serde(rename_all = "camelCase", tag = "by")]
pub enum JoinByConfig {
  Danmu {
    #[serde(default = "join_by_danmu_content_default")]
    content: String,
  },
  Gift {
    #[serde(default = "join_by_gift_gift_id_default")]
    gift_id: i32,
    #[serde(default = "join_by_gift_gift_value_default")]
    gift_value: i32,
  },
}

fn join_by_danmu_content_default() -> String {
  "".to_string()
}

fn join_by_gift_gift_id_default() -> i32 {
  -1
}

fn join_by_gift_gift_value_default() -> i32 {
  -1
}
