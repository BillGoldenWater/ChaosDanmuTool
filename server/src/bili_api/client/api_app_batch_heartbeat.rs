use serde_aux::prelude::deserialize_default_from_null;
use share::{data_primitives::game_id::GameId, define_data_type};

define_data_type!(
    struct ReqAppBatchHeartbeat {
        pub game_ids: Vec<GameId>,
    }
);

define_data_type!(
    struct ResAppBatchHeartbeat {
        #[serde(deserialize_with = "deserialize_default_from_null")]
        pub failed_game_ids: Vec<GameId>,
    }
);
