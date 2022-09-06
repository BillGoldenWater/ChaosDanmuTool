pub use static_object_derive::*;

pub trait StaticObject {
  fn i() -> &'static mut Self;
}
