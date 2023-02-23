/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

pub fn gen_time_with_uuid() -> String {
  format!(
    "{ts}_{uuid}",
    ts = chrono::Local::now().format("%Y-%m-%d_%H-%M-%S_%3f"),
    uuid = uuid::Uuid::new_v4(),
  )
}
