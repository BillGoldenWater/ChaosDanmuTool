use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Hash, Serialize, Deserialize)]
pub struct WebsocketInfo {
    pub auth_body: Box<str>,
    pub wss_link: Vec<Box<str>>,
}
