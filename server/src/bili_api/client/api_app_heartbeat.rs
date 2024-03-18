use serde::{Deserialize, Serialize};
use share::data_primitives::game_id::GameId;

#[derive(Debug, Clone, PartialEq, Hash, Serialize, Deserialize)]
pub struct ReqAppHeartbeat {
    pub game_id: GameId,
}

#[derive(Debug, Clone, PartialEq, Hash, Serialize, Deserialize)]
pub struct ResAppHeartbeat {}
