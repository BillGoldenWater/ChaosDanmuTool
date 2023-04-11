/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

pub fn url_http_to_https(url: &str) -> String {
  if url.starts_with("https") {
    url.to_owned()
  } else {
    url.replace("http", "https")
  }
}
