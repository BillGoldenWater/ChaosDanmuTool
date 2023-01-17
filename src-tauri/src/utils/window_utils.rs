/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use tauri::Window;

#[allow(unused_variables)]
pub fn set_visible_on_all_workspaces(
  window: &Window,
  visible: bool,
  visible_on_full_screen: bool,
  skip_transform_process_type: bool,
) {
  #[cfg(target_os = "macos")]
  unsafe {
    use crate::utils::process_utils::{get_psn, TransformProcessType};
    use cocoa::appkit::{NSWindow, NSWindowCollectionBehavior};
    use MacTypes_sys::ProcessSerialNumberPtr;

    let ns_window = window.ns_window().unwrap() as cocoa::base::id;

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
      window,
      visible,
      NSWindowCollectionBehavior::NSWindowCollectionBehaviorCanJoinAllSpaces,
    );
    set_collection_behavior(
      window,
      visible_on_full_screen,
      NSWindowCollectionBehavior::NSWindowCollectionBehaviorFullScreenAuxiliary,
    );
  }
}

#[allow(unused_variables)]
#[cfg(target_os = "macos")]
pub fn set_collection_behavior(
  window: &Window,
  enable: bool,
  collection_behavior: cocoa::appkit::NSWindowCollectionBehavior,
) {
  unsafe {
    use cocoa::appkit::{NSControl, NSWindow, NSWindowButton};

    let ns_window = window.ns_window().unwrap() as cocoa::base::id;

    if enable {
      ns_window.setCollectionBehavior_(ns_window.collectionBehavior() | collection_behavior);
    } else {
      ns_window.setCollectionBehavior_(ns_window.collectionBehavior() & (!collection_behavior));
    }

    ns_window
      .standardWindowButton_(NSWindowButton::NSWindowZoomButton)
      .setEnabled_(cocoa::base::YES);
  }
}
