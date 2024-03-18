use serde::{Deserialize, Serialize};

use crate::data_primitives::game_id::GameId;

#[derive(Debug, Clone, PartialEq, Hash, Serialize, Deserialize)]
pub struct GameInfo {
    pub game_id: GameId,
}
