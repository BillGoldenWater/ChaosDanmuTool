use std::fmt::Display;

use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct ResponseError {
    pub code: i64,
    pub message: Box<str>,
    pub request_id: Box<str>,
}

impl std::error::Error for ResponseError {}

impl Display for ResponseError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(
            f,
            "[{code}:{req_id}] {msg}",
            code = self.code,
            msg = self.message,
            req_id = self.request_id
        )
    }
}
