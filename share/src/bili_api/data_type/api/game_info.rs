use crate::{data_primitives::game_id::GameId, define_data_type};

define_data_type!(
    struct GameInfo {
        pub game_id: GameId,
    }
);
