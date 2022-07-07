/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

#[macro_export]
#[allow(unused_macros)]
macro_rules! location_info {
  () => {
    format!("[{}, {}:{}]", file!(), line!(), column!())
  };
}