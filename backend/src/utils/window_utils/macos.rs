/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use icrate::AppKit::{
  NSWindow, NSWindowCollectionBehavior, NSWindowCollectionBehaviorCanJoinAllSpaces,
  NSWindowCollectionBehaviorFullScreenAuxiliary, NSWindowZoomButton,
};
use tauri::Window;

use crate::utils::process_utils::macos::{get_psn, ProcessSerialNumberPtr, TransformProcessType};

pub fn set_visible_on_all_workspaces(
  window: &Window,
  visible: bool,
  visible_on_full_screen: bool,
  skip_transform_process_type: bool,
) {
  unsafe {
    let ns_window = window.ns_window().unwrap() as *mut NSWindow;
    let ns_window = if let Some(ns_window) = ns_window.as_ref() {
      ns_window
    } else {
      return;
    };

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

      if visible_on_full_screen {
        ns_window.setCanHide(false);
        TransformProcessType(psn_ptr, 4); // kProcessTransformToUIElementApplication = 4
      } else {
        ns_window.setCanHide(true);
        TransformProcessType(psn_ptr, 1); // kProcessTransformToForegroundApplication = 1
      }
    }

    set_collection_behavior(window, visible, NSWindowCollectionBehaviorCanJoinAllSpaces);
    set_collection_behavior(
      window,
      visible_on_full_screen,
      NSWindowCollectionBehaviorFullScreenAuxiliary,
    );
  }
}

pub fn set_collection_behavior(
  window: &Window,
  enable: bool,
  collection_behavior: NSWindowCollectionBehavior,
) {
  unsafe {
    let ns_window = window.ns_window().unwrap() as *mut NSWindow;
    let ns_window = if let Some(ns_window) = ns_window.as_ref() {
      ns_window
    } else {
      return;
    };

    if enable {
      ns_window.setCollectionBehavior(ns_window.collectionBehavior() | collection_behavior);
    } else {
      ns_window.setCollectionBehavior(ns_window.collectionBehavior() & (!collection_behavior));
    }

    if let Some(ns_button) = ns_window.standardWindowButton(NSWindowZoomButton) {
      ns_button.setEnabled(true);
    }
  }
}
