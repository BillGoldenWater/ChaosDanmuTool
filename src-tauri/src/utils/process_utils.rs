/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

#[cfg(target_os = "macos")]
#[allow(non_snake_case)]
#[repr(C)]
#[derive(Clone, Copy, Debug, Default, Eq, Hash, PartialEq)]
pub struct ProcessSerialNumber {
  pub highLongOfPSN: u32,
  pub lowLongOfPSN: u32,
}

#[cfg(target_os = "macos")]
pub type ProcessSerialNumberPtr = *mut ProcessSerialNumber;
#[cfg(target_os = "macos")]
pub type OSStatus = i32;

#[cfg(target_os = "macos")]
#[link(name = "ApplicationServices", kind = "framework")]
extern "C" {
  pub(crate) fn TransformProcessType(psn: ProcessSerialNumberPtr, transform_state: u32)
    -> OSStatus;
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
