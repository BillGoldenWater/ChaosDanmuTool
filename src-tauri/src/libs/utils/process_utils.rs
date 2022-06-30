/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use MacTypes_sys::{ProcessSerialNumber, ProcessSerialNumberPtr};

pub fn get_psn_ptr() -> *mut ProcessSerialNumber {
  ProcessSerialNumberPtr::from(&mut get_psn() as *mut ProcessSerialNumber)
}

pub fn get_psn() -> ProcessSerialNumber {
  ProcessSerialNumber { highLongOfPSN: 0, lowLongOfPSN: 2 }
}