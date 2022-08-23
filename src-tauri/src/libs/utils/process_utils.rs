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

#[cfg(target_os = "macos")]
pub fn is_running_under_rosetta() -> std::io::Result<bool> {
  unsafe {
    let mut ret = 0;

    let attr_name = std::ffi::CString::new("sysctl.proc_translated").unwrap();

    let error = libc::sysctlbyname(
      attr_name.as_ptr(),
      &mut ret as *mut std::os::raw::c_int as *mut std::ffi::c_void,
      &mut 8,
      std::ptr::null_mut(),
      0,
    );

    if error < std::os::raw::c_int::default() {
      return Err(std::io::Error::last_os_error());
    }

    Ok(ret == 1)
  }
}
