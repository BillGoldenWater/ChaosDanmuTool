use std::time::Duration;

use tokio::{
  sync::{Mutex, MutexGuard},
  time::timeout,
};

use crate::{error, libs::utils::trace_utils::print_trace};

lazy_static! {
  static ref TIMEOUT_MILLIS: u64 =
    std::env::var("LOCK_TIMEOUT_MILLIS").map_or(1000, |it| it.parse::<u64>().unwrap_or(1000));
}

pub fn lock<T>(mutex: &Mutex<T>) -> MutexGuard<'_, T> {
  lock_custom_timeout(mutex, 1000)
}

pub fn lock_custom_timeout<T>(mutex: &Mutex<T>, time_millis: u64) -> MutexGuard<'_, T> {
  tokio::task::block_in_place(|| {
    tokio::runtime::Handle::current().block_on(a_lock_custom_timeout(mutex, time_millis))
  })
}

pub async fn a_lock<T>(mutex: &Mutex<T>) -> MutexGuard<'_, T> {
  a_lock_custom_timeout(mutex, 1000).await
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
