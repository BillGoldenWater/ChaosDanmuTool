use share::{data_primitives::game_id::GameId, define_data_type};

define_data_type!(
    struct ReqAppHeartbeat {
        pub game_id: GameId,
    }
);

define_data_type!(
    struct ResAppHeartbeat {}
);
