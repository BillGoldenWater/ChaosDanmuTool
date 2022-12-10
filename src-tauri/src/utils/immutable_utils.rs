/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use std::ops::Deref;

pub struct Immutable<T> {
  inner: T,
}

impl<T> Immutable<T> {
  pub fn new(value: T) -> Immutable<T> {
    Self { inner: value }
  }
}

impl<T> Deref for Immutable<T> {
  type Target = T;

  fn deref(&self) -> &Self::Target {
    &self.inner
  }
}
