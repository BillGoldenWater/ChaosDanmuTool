/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

#[cfg(target_os = "macos")]
use MacTypes_sys::{OSStatus, ProcessSerialNumber};
#[cfg(target_os = "macos")]
use raw_window_handle::HasRawWindowHandle;
use tauri::{Window, Wry};

#[cfg(target_os = "macos")]
use crate::libs::utils::process_utils::get_psn_ptr;

#[cfg(target_os = "macos")]
#[link(name = "ApplicationServices", kind = "framework")]
extern {
  fn TransformProcessType(psn: *mut ProcessSerialNumber, transform_state: u32) -> OSStatus;
}

pub fn set_visible_on_all_workspaces(window: Window<Wry>,
                                     visible: bool,
                                     visible_on_full_screen: bool,
                                     skip_transform_process_type: bool) {
  #[cfg(target_os = "macos")] unsafe {
    use cocoa::appkit::{NSWindow, NSWindowCollectionBehavior};

    let ns_window = get_ns_window(window).unwrap();

    // In order for NSWindows to be visible on fullscreen we need to functionally
    // mimic app.dock.hide() since Apple changed the underlying functionality of
    // NSWindows starting with 10.14 to disallow NSWindows from floating on top of
    // fullscreen apps.
    // from electron:
    //   https://github.com/electron/electron/blob/c885f9063bda5032fe430bbee724f77b66ce034a/shell/browser/native_window_mac.mm#L1342-L1363

    if !skip_transform_process_type {
      let psn = get_psn_ptr();
      use objc::runtime::{NO, YES};

      if visible_on_full_screen {
        ns_window.setCanHide_(NO);
        TransformProcessType(psn, 4);
      } else {
        ns_window.setCanHide_(YES);
        TransformProcessType(psn, 1);
      }
    }

    set_collection_behavior(ns_window,
                            visible,
                            NSWindowCollectionBehavior::NSWindowCollectionBehaviorCanJoinAllSpaces);
    set_collection_behavior(ns_window,
                            visible_on_full_screen,
                            NSWindowCollectionBehavior::NSWindowCollectionBehaviorFullScreenAuxiliary);
  }
}

#[cfg(target_os = "macos")]
pub unsafe fn set_collection_behavior(ns_window: cocoa::base::id,
                                      enable: bool,
                                      collection_behavior: cocoa::appkit::NSWindowCollectionBehavior) {
  use cocoa::appkit::NSWindow;

  if enable {
    ns_window.setCollectionBehavior_(ns_window.collectionBehavior() | collection_behavior);
  } else {
    ns_window.setCollectionBehavior_(ns_window.collectionBehavior() & (!collection_behavior));
  }
}

#[cfg(target_os = "macos")]
pub fn get_ns_window(window: Window<Wry>) -> Option<cocoa::base::id> {
  use raw_window_handle::RawWindowHandle::AppKit;

  if let AppKit(handle) = window.raw_window_handle() {
    Some(handle.ns_window as cocoa::base::id)
  } else {
    None
  }
}