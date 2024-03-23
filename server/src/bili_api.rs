use serde::{de::DeserializeOwned, Serialize};

pub mod client;
pub mod response_error;
pub mod utils;

pub trait BiliRequest: Serialize {
    const ENDPOINT: &'static str;

    type Response: DeserializeOwned;
}
