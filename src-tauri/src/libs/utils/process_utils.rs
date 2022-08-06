/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

#[cfg(target_os = "macos")]
use MacTypes_sys::{ProcessSerialNumber, ProcessSerialNumberPtr};

#[cfg(target_os = "macos")]
pub fn get_psn_ptr() -> *mut ProcessSerialNumber {
  ProcessSerialNumberPtr::from(&mut get_psn() as *mut ProcessSerialNumber)
}

#[cfg(target_os = "macos")]
pub fn get_psn() -> ProcessSerialNumber {
  ProcessSerialNumber {
    highLongOfPSN: 0,
    lowLongOfPSN: 2,
  }
}
