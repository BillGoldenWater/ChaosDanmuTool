use serde::{Deserialize, Serialize};

use crate::data_primitives::{auth_body::AuthBody, wss_link::WssLink};

#[derive(Debug, Clone, PartialEq, Hash, Serialize, Deserialize)]
pub struct WebsocketInfo {
    pub auth_body: AuthBody,
    pub wss_link: WssLink,
}
