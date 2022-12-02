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
