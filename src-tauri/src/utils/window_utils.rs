/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

#[cfg(target_os = "macos")]
pub fn set_visible_on_all_workspaces<Window: raw_window_handle::HasRawWindowHandle>(
  window: &Window,
  visible: bool,
  visible_on_full_screen: bool,
  skip_transform_process_type: bool,
) {
  unsafe {
    use crate::utils::process_utils::{get_psn, TransformProcessType};
    use cocoa::appkit::{NSWindow, NSWindowCollectionBehavior};
    use MacTypes_sys::ProcessSerialNumberPtr;

    let ns_window = get_ns_window(window).unwrap();

    // In order for NSWindows to be visible on fullscreen we need to functionally
    // mimic app.dock.hide() since Apple changed the underlying functionality of
    // NSWindows starting with 10.14 to disallow NSWindows from floating on top of
    // fullscreen apps.
    //
    // from electron:
    //   https://github.com/electron/electron/blob/ad1a09bb10870a73de95232d97886ae273226242/shell/browser/native_window_mac.mm#L1278-L1299

    if !skip_transform_process_type {
      let mut psn = get_psn();
      let psn_ptr = (&mut psn) as ProcessSerialNumberPtr;
      use objc::runtime::{NO, YES};

      if visible_on_full_screen {
        ns_window.setCanHide_(NO);
        TransformProcessType(psn_ptr, 4); // kProcessTransformToUIElementApplication = 4
      } else {
        ns_window.setCanHide_(YES);
        TransformProcessType(psn_ptr, 1); // kProcessTransformToForegroundApplication = 1
      }
    }

    set_collection_behavior(
      ns_window,
      visible,
      NSWindowCollectionBehavior::NSWindowCollectionBehaviorCanJoinAllSpaces,
    );
    set_collection_behavior(
      ns_window,
      visible_on_full_screen,
      NSWindowCollectionBehavior::NSWindowCollectionBehaviorFullScreenAuxiliary,
    );
  }
}

#[allow(clippy::missing_safety_doc)]
#[cfg(target_os = "macos")]
pub unsafe fn set_collection_behavior(
  ns_window: cocoa::base::id,
  enable: bool,
  collection_behavior: cocoa::appkit::NSWindowCollectionBehavior,
) {
  use cocoa::appkit::NSWindow;

  if enable {
    ns_window.setCollectionBehavior_(ns_window.collectionBehavior() | collection_behavior);
  } else {
    ns_window.setCollectionBehavior_(ns_window.collectionBehavior() & (!collection_behavior));
  }
}

#[cfg(target_os = "macos")]
pub fn get_ns_window<Window: raw_window_handle::HasRawWindowHandle>(
  window: &Window,
) -> Option<cocoa::base::id> {
  use raw_window_handle::RawWindowHandle::AppKit;

  if let AppKit(handle) = window.raw_window_handle() {
    Some(handle.ns_window as cocoa::base::id)
  } else {
    None
  }
}
