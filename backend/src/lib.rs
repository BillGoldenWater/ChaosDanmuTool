/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

#![allow(clippy::module_inception)]
#![allow(clippy::new_without_default)]

#[macro_use]
extern crate lazy_static;
extern crate core;

pub mod app;
pub mod app_context;
pub mod cache;
pub mod command;
pub mod config;
pub mod network;
pub mod types;
pub mod utils;
