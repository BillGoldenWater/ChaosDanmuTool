/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use std::time::Duration;

use log::error;
use tokio::{
  sync::{Mutex, MutexGuard},
  time::timeout,
};

use crate::app_context::AppContext;
use crate::utils::async_utils::run_blocking;
use crate::utils::trace_utils::print_trace;

lazy_static! {
  static ref TIMEOUT_MILLIS: u64 = AppContext::i().args.lock_timeout_millis;
}

pub fn lock<T>(mutex: &Mutex<T>) -> MutexGuard<'_, T> {
  lock_custom_timeout(mutex, *TIMEOUT_MILLIS)
}

pub fn lock_custom_timeout<T>(mutex: &Mutex<T>, time_millis: u64) -> MutexGuard<'_, T> {
  run_blocking(a_lock_custom_timeout(mutex, time_millis))
}

pub async fn a_lock<T>(mutex: &Mutex<T>) -> MutexGuard<'_, T> {
  a_lock_custom_timeout(mutex, *TIMEOUT_MILLIS).await
}

pub async fn a_lock_custom_timeout<T>(mutex: &Mutex<T>, time_millis: u64) -> MutexGuard<'_, T> {
  loop {
    let lock_result = timeout(Duration::from_millis(time_millis), mutex.lock()).await;
    if let Err(err) = lock_result {
      error!("failed to get lock in {time_millis}ms, {err:?}");
      print_trace();
      continue;
    } else {
      return lock_result.unwrap();
    }
  }
}
