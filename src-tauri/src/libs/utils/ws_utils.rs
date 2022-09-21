use std::borrow::Cow;

use tokio_tungstenite::tungstenite::protocol::{frame::coding::CloseCode, CloseFrame};

#[inline]
pub fn close_frame(code: CloseCode, reason: &str) -> Option<CloseFrame> {
  Some(CloseFrame {
    code,
    reason: Cow::Borrowed(reason),
  })
}
