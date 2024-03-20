use share::{data_primitives::game_id::GameId, define_data_type};

use super::data_primitives::auth_key_id::AuthKeyId;

define_data_type!(
    struct SessionInfo {
        pub key_id: AuthKeyId,
        pub game_id: GameId,
    }
);
