/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use std::sync::Mutex;

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

#[allow(unused_variables)]
pub fn set_nap(enable: bool, reason: &str) {
  #[allow(non_upper_case_globals)]
  #[cfg(target_os = "macos")]
  {
    use cocoa::base::nil;
    use cocoa::foundation::{NSProcessInfo, NSString};
    use objc::{runtime::Object, *};
    use objc_id::Id;
    use once_cell::sync::Lazy;

    const NSActivityIdleSystemSleepDisabled: u64 = 1u64 << 20;
    const NSActivitySuddenTerminationDisabled: u64 = 1u64 << 14;
    const NSActivityAutomaticTerminationDisabled: u64 = 1u64 << 15;
    const NSActivityUserInitiated: u64 = 0x00FFFFFFu64 | NSActivityIdleSystemSleepDisabled;
    const NSActivityLatencyCritical: u64 = 0xFF00000000u64;

    const options: u64 = NSActivityIdleSystemSleepDisabled
      | NSActivitySuddenTerminationDisabled
      | NSActivityAutomaticTerminationDisabled
      | NSActivityUserInitiated
      | NSActivityLatencyCritical;

    static ACTIVITY_ID: Lazy<Mutex<Option<Id<Object>>>> = Lazy::new(|| Mutex::new(None));

    let process_info = unsafe { NSProcessInfo::processInfo(nil) };

    if enable {
      if let Some(activity_id) = ACTIVITY_ID.lock().unwrap().take() {
        unsafe {
          let _: () = msg_send![process_info, endActivity: activity_id];
        }
      }
    } else {
      if ACTIVITY_ID.lock().unwrap().is_some() {
        set_nap(true, "");
      }

      let activity_id: Id<Object> = unsafe {
        let reason = NSString::alloc(nil).init_str(if reason.is_empty() { "none" } else { reason });
        msg_send![process_info, beginActivityWithOptions:options reason:reason]
      };

      *ACTIVITY_ID.lock().unwrap() = Some(activity_id);
    }
  }
}
