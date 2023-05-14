/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use std::sync::Mutex;
use std::{
  ffi::{c_void, CString},
  io,
  os::raw::c_int,
  ptr,
};

use icrate::{
  Foundation::NSProcessInfo,
  Foundation::{
    NSActivityAutomaticTerminationDisabled, NSActivityIdleSystemSleepDisabled,
    NSActivityLatencyCritical, NSActivitySuddenTerminationDisabled, NSActivityUserInitiated,
  },
  Foundation::{NSActivityOptions, NSString},
};
use objc2::{rc::Id, rc::Shared, runtime::NSObject};
use once_cell::sync::Lazy;

#[link(name = "ApplicationServices", kind = "framework")]
extern "C" {
  pub(crate) fn TransformProcessType(psn: ProcessSerialNumberPtr, transform_state: u32)
    -> OSStatus;
}

#[allow(non_snake_case)]
#[repr(C)]
#[derive(Clone, Copy, Debug, Default, Eq, Hash, PartialEq)]
pub struct ProcessSerialNumber {
  pub highLongOfPSN: u32,
  pub lowLongOfPSN: u32,
}

pub type ProcessSerialNumberPtr = *mut ProcessSerialNumber;

pub type OSStatus = i32;

pub fn get_psn() -> ProcessSerialNumber {
  ProcessSerialNumber {
    highLongOfPSN: 0,
    lowLongOfPSN: 2,
  }
}

pub fn is_running_under_rosetta() -> io::Result<bool> {
  unsafe {
    let mut ret = 0;

    let attr_name = CString::new("sysctl.proc_translated").unwrap();

    let error = libc::sysctlbyname(
      attr_name.as_ptr(),
      &mut ret as *mut c_int as *mut c_void,
      &mut 8,
      ptr::null_mut(),
      0,
    );

    if error < c_int::default() {
      return Err(io::Error::last_os_error());
    }

    Ok(ret == 1)
  }
}

pub fn set_nap(enable: bool, reason: &str) {
  struct ForceSend<T>(T);
  unsafe impl<T> Send for ForceSend<T> {}

  type ActivityId = Mutex<Option<ForceSend<Id<NSObject, Shared>>>>;

  const OPTIONS: NSActivityOptions = NSActivityIdleSystemSleepDisabled
    | NSActivitySuddenTerminationDisabled
    | NSActivityAutomaticTerminationDisabled
    | NSActivityUserInitiated
    | NSActivityLatencyCritical;

  static ACTIVITY_ID: Lazy<ActivityId> = Lazy::new(|| Mutex::new(None));

  let process_info = NSProcessInfo::processInfo();

  if enable {
    if let Some(activity_id) = ACTIVITY_ID.lock().unwrap().take() {
      unsafe { process_info.endActivity(&activity_id.0) }
    }
  } else {
    if ACTIVITY_ID.lock().unwrap().is_some() {
      set_nap(true, "");
    }

    let activity_id =
      unsafe { process_info.beginActivityWithOptions_reason(OPTIONS, &NSString::from_str(reason)) };

    *ACTIVITY_ID.lock().unwrap() = Some(ForceSend(activity_id));
  }
}
