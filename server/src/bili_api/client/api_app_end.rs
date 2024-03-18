use serde::{Deserialize, Serialize};
use share::data_primitives::game_id::GameId;

#[derive(Debug, Clone, PartialEq, Hash, Serialize, Deserialize)]
pub struct ReqAppEnd {
    pub app_id: i64,
    pub game_id: GameId,
}

#[derive(Debug, Clone, PartialEq, Hash, Serialize, Deserialize)]
pub struct ResAppEnd {}
