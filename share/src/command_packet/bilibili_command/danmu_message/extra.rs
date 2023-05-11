/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use std::collections::HashMap;

use crate::types::bilibili::emot::Emot;

#[derive(serde::Serialize, serde::Deserialize, Default, PartialEq, Eq, Debug, Clone)]
pub struct Extra {
  pub emots: Option<HashMap<String, Emot>>,
}
