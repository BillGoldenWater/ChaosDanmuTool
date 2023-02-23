/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use std::future::Future;

pub fn run_blocking<F: Future>(task: F) -> F::Output {
  tokio::task::block_in_place(|| tokio::runtime::Handle::current().block_on(task))
}
