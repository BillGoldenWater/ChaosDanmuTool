/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use serde_json::Value;

#[derive(serde::Serialize, serde::Deserialize, type_exporter::TE, PartialEq, Eq, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct GiftConfigUpdate {
  #[te(retype = "unknown")]
  gift_config_response: Value,
}

impl GiftConfigUpdate {
  pub fn new(gift_config_response: Value) -> GiftConfigUpdate {
    GiftConfigUpdate {
      gift_config_response,
    }
  }
}
