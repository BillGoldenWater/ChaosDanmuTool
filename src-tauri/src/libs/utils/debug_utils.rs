/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

#[macro_export]
#[allow(unused_macros)]
macro_rules! location_info {
  () => {
    format!("[{}, {}:{}, {:?}]", file!(), line!(), column!(), std::thread::current().id())
  };
}

#[macro_export]
#[allow(unused_macros)]
macro_rules! lprintln {
  () => {
        println!("{}", $crate::location_info!());
    };
    ($($arg:tt)*) => {{
        println!("{} {}", $crate::location_info!(), format!($($arg)*));
    }};
}

#[macro_export]
#[allow(unused_macros)]
macro_rules! elprintln {
  () => {
        eprintln!("{}", $crate::location_info!());
    };
    ($($arg:tt)*) => {{
        eprintln!("{} {}", $crate::location_info!(), format!($($arg)*));
    }};
}