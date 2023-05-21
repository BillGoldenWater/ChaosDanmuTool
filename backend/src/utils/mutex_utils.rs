/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

#[cfg(all(debug_assertions, feature = "lock_debug"))]
use std::collections::HashMap;
use std::time::Duration;

use log::error;
use once_cell::sync::Lazy;
#[cfg(all(debug_assertions, feature = "lock_debug"))]
use tokio::sync::RwLock;
use tokio::{
  sync::{Mutex, MutexGuard},
  time::timeout,
};

use crate::app_context::AppContext;
use crate::utils::async_utils::run_blocking;
#[cfg(all(debug_assertions, feature = "lock_debug"))]
use crate::utils::trace_utils::gen_trace_message;
use crate::utils::trace_utils::print_trace;

static TIMEOUT_MILLIS: Lazy<u64> = Lazy::new(|| AppContext::i().args.lock_timeout_millis);

pub fn lock<'a, T>(id: &'static str, mutex: &'a Mutex<T>) -> MutexGuard<'a, T> {
  lock_custom_timeout(id, mutex, *TIMEOUT_MILLIS)
}

pub fn lock_custom_timeout<'a, T>(
  id: &'static str,
  mutex: &'a Mutex<T>,
  time_millis: u64,
) -> MutexGuard<'a, T> {
  run_blocking(a_lock_custom_timeout(id, mutex, time_millis))
}

pub async fn a_lock<'a, T>(id: &'static str, mutex: &'a Mutex<T>) -> MutexGuard<'a, T> {
  a_lock_custom_timeout(id, mutex, *TIMEOUT_MILLIS).await
}

#[cfg(all(debug_assertions, feature = "lock_debug"))]
static LOCKER_INFO: Lazy<RwLock<HashMap<&'static str, String>>> =
  Lazy::new(|| RwLock::new(HashMap::new()));

pub async fn a_lock_custom_timeout<'a, T>(
  id: &'static str,
  mutex: &'a Mutex<T>,
  time_millis: u64,
) -> MutexGuard<'a, T> {
  loop {
    let lock_result = timeout(Duration::from_millis(time_millis), mutex.lock()).await;
    if let Ok(result) = lock_result {
      #[cfg(all(debug_assertions, feature = "lock_debug"))]
      LOCKER_INFO.write().await.insert(id, gen_trace_message());
      return result;
    } else {
      #[cfg(all(debug_assertions, feature = "lock_debug"))]
      {
        if let Some(info) = LOCKER_INFO.read().await.get(id) {
          error!("failed to get lock in {time_millis}ms, owner trace: \n{info}\n")
        } else {
          error!("failed to get lock in {time_millis}ms, no owner trace");
        }
      }
      #[cfg(not(all(debug_assertions, feature = "lock_debug")))]
      error!("failed to get lock in {time_millis}ms, id: {id}");
      print_trace();
      continue;
    }
  }
}
