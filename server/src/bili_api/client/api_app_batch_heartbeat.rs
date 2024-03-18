use serde::{Deserialize, Serialize};
use serde_aux::prelude::deserialize_default_from_null;
use share::data_primitives::game_id::GameId;

#[derive(Debug, Clone, PartialEq, Hash, Serialize, Deserialize)]
pub struct ReqAppBatchHeartbeat {
    pub game_ids: Vec<GameId>,
}

#[derive(Debug, Clone, PartialEq, Hash, Serialize, Deserialize)]
pub struct ResAppBatchHeartbeat {
    #[serde(deserialize_with = "deserialize_default_from_null")]
    pub failed_game_ids: Vec<GameId>,
}
